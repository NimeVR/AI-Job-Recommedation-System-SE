import pandas as pd
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from pymongo import MongoClient

class JobRecommender:
    """
    A job recommender that reads from both 'created_jobs' and 'jobs' collections.
    Created jobs get higher priority in recommendations.
    """
    def __init__(self):
        """
        Initializes the recommender by fetching from both collections.
        """
        # Connect to MongoDB
        client = MongoClient("mongodb://localhost:27017/")
        db = client["jobrecommender"]
        
        # Fetch from both collections
        created_jobs_from_db = list(db["created_jobs"].find({}))
        jobs_from_db = list(db["jobs"].find({}))
        skills_from_db = list(db["skills"].find({}))
        client.close()

        # Combine jobs: created_jobs first (higher priority)
        all_jobs = created_jobs_from_db + jobs_from_db
        
        # Handle empty data
        if not all_jobs or not skills_from_db:
            self.jobs = pd.DataFrame()
            print(" WARNING: No jobs or skills found in MongoDB. Recommender will be inactive.")
            return
        
        print(f" Loaded {len(created_jobs_from_db)} created jobs + {len(jobs_from_db)} generated jobs = {len(all_jobs)} total")
            
        # Create skill lookup map
        skill_id_to_name_map = {skill['_id']: skill['name'] for skill in skills_from_db}

        # Convert to DataFrame
        self.jobs = pd.DataFrame(all_jobs)
        
        # Add priority flag (created jobs = 1, generated jobs = 0)
        self.jobs['priority'] = [1 if i < len(created_jobs_from_db) else 0 
                                 for i in range(len(all_jobs))]

        # Map ObjectIds to skill names
        def map_ids_to_names(id_list):
            if not isinstance(id_list, list): 
                return []
            return [skill_id_to_name_map.get(oid) for oid in id_list 
                    if oid in skill_id_to_name_map]
        
        self.jobs['skills_list'] = self.jobs['skillsRequired'].apply(map_ids_to_names)
        self.jobs['skills_str'] = self.jobs['skills_list'].apply(lambda x: ', '.join(x))
        
        # Fill NaN values with empty string
        self.jobs['skills_str'] = self.jobs['skills_str'].fillna('')
        
        # Replace any remaining NaN in string columns
        self.jobs['Category'] = self.jobs['Category'].fillna('Unknown')
        self.jobs['companyName'] = self.jobs['companyName'].fillna('Unknown Company')
        self.jobs['Workplace'] = self.jobs['Workplace'].fillna('Not Specified')
        self.jobs['Location'] = self.jobs['Location'].fillna('Not Specified')
        self.jobs['Type'] = self.jobs['Type'].fillna('Not Specified')
        self.jobs['jobDescription'] = self.jobs['jobDescription'].fillna('')
        
        # Initialize TF-IDF Vectorizer
        self.vectorizer = TfidfVectorizer(
            tokenizer=lambda x: [skill.strip() for skill in x.split(',') if skill.strip()]
        )
        self.tfidf_matrix = self.vectorizer.fit_transform(self.jobs['skills_str'])
        
        print(f" TF-IDF matrix created with shape: {self.tfidf_matrix.shape}")

    def recommend(self, user_skills):
        """
        Recommends jobs based on user skills.
        Created jobs (priority=1) appear first in results.
        Returns a list of job dictionaries with proper JSON-serializable values.
        """
        if self.jobs.empty:
            return []

        # Transform user skills
        user_profile = self.vectorizer.transform([', '.join(user_skills)])
        cosine_similarities = cosine_similarity(user_profile, self.tfidf_matrix).flatten()
        
        # Add similarity to dataframe
        self.jobs['similarity'] = cosine_similarities
        
        # Replace any NaN similarities with 0
        self.jobs['similarity'] = self.jobs['similarity'].fillna(0)
        
        # Sort by priority first, then similarity
        sorted_jobs = self.jobs.sort_values(
            by=['priority', 'similarity'], 
            ascending=[False, False]
        )
        
        # Get top recommendations with similarity > 0
        recommendations = []
        for idx, row in sorted_jobs.iterrows():
            if row['similarity'] > 0 and len(recommendations) < 50:
                # Ensure all values are JSON-serializable
                job_dict = {
                    "job_id": str(row['_id']),
                    "title": str(row['Category']) if pd.notna(row['Category']) else 'Unknown',
                    "companyName": str(row['companyName']) if pd.notna(row['companyName']) else 'Unknown Company',
                    "Workplace": str(row['Workplace']) if pd.notna(row['Workplace']) else 'Not Specified',
                    "Location": str(row['Location']) if pd.notna(row['Location']) else 'Not Specified',
                    "Type": str(row['Type']) if pd.notna(row['Type']) else 'Not Specified',
                    "jobDescription": str(row['jobDescription']) if pd.notna(row['jobDescription']) else '',
                    "skills": row['skills_list'] if isinstance(row['skills_list'], list) else [],
                    "similarity": round(float(row['similarity']), 4) if pd.notna(row['similarity']) else 0.0
                }
                
                # Final safety check: ensure similarity is not NaN/Inf
                if not np.isfinite(job_dict['similarity']):
                    job_dict['similarity'] = 0.0
                
                recommendations.append(job_dict)
        
        print(f"Generated {len(recommendations)} recommendations for skills: {user_skills}")
        return recommendations
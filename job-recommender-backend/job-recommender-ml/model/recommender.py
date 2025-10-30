import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from pymongo import MongoClient

class JobRecommender:
    """
    A job recommender that reads normalized data (with ObjectId references)
    directly from MongoDB.
    """
    def __init__(self):
        """
        Initializes the recommender by:
        1. Connecting to MongoDB.
        2. Fetching both jobs and skills collections.
        3. Performing an in-memory "join" to map skill ObjectIds to skill names.
        4. Preparing the TF-IDF matrix from the skill names.
        """
        # --- 1. Connect to MongoDB and fetch all necessary data ---
        client = MongoClient("mongodb://localhost:27017/")
        db = client["jobrecommender"]
        
        # Fetch all documents from both collections
        jobs_from_db = list(db["jobs"].find({}))
        skills_from_db = list(db["skills"].find({}))
        client.close()

        # Handle the case where there is no data
        if not jobs_from_db or not skills_from_db:
            self.jobs = pd.DataFrame() # Create an empty DataFrame
            print("WARNING: No jobs or skills found in MongoDB. Recommender will be inactive.")
            return
            
        # --- 2. Create a fast lookup map for Skill ObjectId -> Skill Name ---
        # This is highly efficient. We do one lookup instead of querying the DB repeatedly.
        skill_id_to_name_map = {skill['_id']: skill['name'] for skill in skills_from_db}

        # --- 3. Convert to Pandas DataFrame and process the data ---
        self.jobs = pd.DataFrame(jobs_from_db)

        # Create a new column 'skills_list' containing the actual skill names (strings)
        # It maps the ObjectIds in 'skillsRequired' to names using our lookup map.
        def map_ids_to_names(id_list):
            if not isinstance(id_list, list): return []
            return [skill_id_to_name_map.get(oid) for oid in id_list if oid in skill_id_to_name_map]
        
        self.jobs['skills_list'] = self.jobs['skillsRequired'].apply(map_ids_to_names)
        
        # Create the final string representation for the vectorizer
        self.jobs['skills_str'] = self.jobs['skills_list'].apply(lambda x: ', '.join(x))
        self.jobs['skills_str'] = self.jobs['skills_str'].fillna('')
        
        # --- 4. Initialize and fit the TF-IDF Vectorizer ---
        self.vectorizer = TfidfVectorizer(tokenizer=lambda x: [skill.strip() for skill in x.split(',')])
        self.tfidf_matrix = self.vectorizer.fit_transform(self.jobs['skills_str'])

    def recommend(self, user_skills):
        """
        Recommends jobs based on a list of user skills (strings).
        """
        # If the recommender was initialized with no data, return an empty list.
        if self.jobs.empty:
            return []

        user_profile = self.vectorizer.transform([', '.join(user_skills)])
        cosine_similarities = cosine_similarity(user_profile, self.tfidf_matrix).flatten()
        
        related_jobs_indices = cosine_similarities.argsort()[:-11:-1]
        
        recommendations = []
        for i in related_jobs_indices:
            if cosine_similarities[i] > 0:
                job = self.jobs.iloc[i]
                recommendations.append({
                    "job_id": str(job['_id']), # Use MongoDB's _id
                    "title": job['Category'],
                    "companyName": job['companyName'],
                    "Workplace": job['Workplace'],
                    "Location": job['Location'],
                    "skills": job['skills_list'], # Return the clean list of skill names
                    "similarity": round(cosine_similarities[i], 4)
                })
        return recommendations
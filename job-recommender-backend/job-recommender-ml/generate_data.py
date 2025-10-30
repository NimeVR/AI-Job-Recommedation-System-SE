import random
from faker import Faker
from pymongo import MongoClient

# --- 1. MongoDB Connection Setup ---
MONGO_URI = "mongodb://localhost:27017/"
DB_NAME = "jobrecommender"
JOBS_COLLECTION_NAME = "jobs"
SKILLS_COLLECTION_NAME = "skills"

client = MongoClient(MONGO_URI)
db = client[DB_NAME]
jobs_collection = db[JOBS_COLLECTION_NAME]
skills_collection = db[SKILLS_COLLECTION_NAME]

print("Connected to MongoDB.")

# --- 2. Skill Definitions ---
common_skills = {
    'Engineering': ['Python', 'Java', 'C++', 'JavaScript', 'SQL', 'Git', 'Docker'],
    'Data Science': ['Python', 'R', 'SQL', 'Machine Learning', 'Data Visualization', 'Pandas', 'TensorFlow'],
    'Marketing': ['SEO', 'Content Creation', 'Social Media', 'Email Marketing', 'Google Analytics'],
    'Finance': ['Financial Modeling', 'Excel', 'Accounting', 'Risk Management'],
    'Human Resources': ['Recruitment', 'Onboarding', 'Employee Relations', 'HRIS'],
    'Generic': ['Communication', 'Problem-Solving', 'Teamwork', 'Project Management']
}

# --- 3. Prime the Skills Collection and Create a Skill-to-ObjectID Map ---
# This step is crucial for efficiency. We process all skills once.
def prime_skills_and_get_map():
    print("Priming skills collection...")
    skill_map = {}
    
    # Get a flat, unique list of all possible skill names
    all_skill_names = set(skill for skill_list in common_skills.values() for skill in skill_list)
    
    for skill_name in all_skill_names:
        # Use lowercase for consistency in the database
        lower_skill_name = skill_name.lower()
        
        # Find-or-Create logic
        skill_doc = skills_collection.find_one_and_update(
            {'name': lower_skill_name},
            {'$setOnInsert': {'name': lower_skill_name}},
            upsert=True, # This will insert if it doesn't exist
            return_document=True # Returns the document after update/insert
        )
        # Store the original-cased name and its corresponding ObjectId
        skill_map[skill_name] = skill_doc['_id']
        
    print(f"Skills collection is ready. Mapped {len(skill_map)} unique skills.")
    return skill_map

# Execute the function to get our lookup map
skill_id_map = prime_skills_and_get_map()

# --- 4. Data Generation Logic ---
fake = Faker('en_US')
job_data_list = []

categories = ['Engineering', 'Marketing', 'Sales', 'Human Resources', 'Finance', 'Data Science', 'Operations']
workplaces = ['On-site', 'Remote', 'Hybrid']
departments = ['Software Development', 'Product Marketing', 'Talent Acquisition', 'Financial Planning', 'Data Analytics', 'Logistics']
job_types = ['Full-time', 'Part-time', 'Contract', 'Internship']

num_rows = 1000
for i in range(1, num_rows + 1):
    category = random.choice(categories)
    
    # Get a list of skill names (strings) for the current job
    if category in common_skills:
        skill_set_names = random.sample(common_skills[category], k=random.randint(2, len(common_skills[category])))
    else:
        skill_set_names = random.sample(common_skills['Generic'], k=2)
    
    # Convert the list of skill names to a list of ObjectIds using our map
    skill_object_ids = [skill_id_map[name] for name in skill_set_names]

    job_document = {
        "companyName": fake.company(),
        "jobDescription": fake.bs(),
        "Category": category,
        "Workplace": random.choice(workplaces),
        "Location": fake.city() + ', ' + fake.state_abbr(),
        "Department": random.choice(departments),
        "Type": random.choice(job_types),
        "skillsRequired": skill_object_ids # Use the list of ObjectIds
    }
    job_data_list.append(job_document)

# --- 5. Insert Data into MongoDB ---
try:
    jobs_collection.delete_many({})
    print(f"Cleared existing documents in '{JOBS_COLLECTION_NAME}' collection.")

    jobs_collection.insert_many(job_data_list)
    print(f"Successfully inserted {len(job_data_list)} new job documents with ObjectId skill references.")

except Exception as e:
    print(f"An error occurred: {e}")

finally:
    client.close()
    print("MongoDB connection closed.")
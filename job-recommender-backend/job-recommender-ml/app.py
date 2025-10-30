from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from model.recommender import JobRecommender

# Initialize app
app = FastAPI(title="Job Recommender ML API", version="1.0")

# Enable CORS for all origins (for Node/React integration)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize recommender with the newly generated dataset
recommender = JobRecommender()

# Input model
class SkillsRequest(BaseModel):
    skills: list[str]

@app.get("/")
def root():
    return {"message": "FastAPI Job Recommender Service Running"}

@app.post("/api/recommend")
def recommend_jobs(request: SkillsRequest):
    print("Entered here ")
    skills = request.skills
    recommendations = recommender.recommend(skills)
    return {"recommendations": recommendations}
import joblib
import pandas as pd
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

app = FastAPI()

with open("final_pipeline.pkl", "rb") as f:
    pipeline = joblib.load(f)


class PredictRequest(BaseModel):
    age: int
    gender: int
    ap_hi: int
    ap_lo: int
    cholest: int
    gluc: int
    smoke: int
    alco: int
    active: int
    bmi: float
    notes: str = ""          #optional


@app.post("/predict")
def predict(data: PredictRequest):
    try:
        df = pd.DataFrame([data.model_dump()])

        proba = pipeline.predict_proba(df)
        risk_score = float(proba[0][1])

        if risk_score < 0.35:
            risk_level = "Low"
        elif risk_score < 0.65:
            risk_level = "Medium"
        else:
            risk_level = "High"

        return {"risk_score": risk_score, "risk_level": risk_level}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
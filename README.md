# 🚦 Traffic Prediction Project

Machine Learning project for predicting road traffic volume using weather and temporal data.

## Features

- Traffic volume prediction
- Exploratory Data Analysis (EDA)
- Feature engineering & preprocessing
- Multiple ML model comparison
- Flask web application
- Real-time prediction interface

---

## Models Used

| Model | R² Score |
|---|---|
| Random Forest | ~0.94 |
| XGBoost Baseline | ~0.95 |
| XGBoost Optimized | ~0.98 |

Final selected model: **Optimized XGBoost**

---

## Tech Stack

### Backend
- Python
- Flask
- XGBoost
- Scikit-learn
- Pandas
- NumPy

### Frontend
- HTML
- CSS
- JavaScript

---

## Project Structure

```text
traffic-prediction-project/
│
├── data/
├── models/
├── notebooks/
├── static/
├── templates/
├── app.py
├── requirements.txt
├── README.md
└── ...
```

---

## Installation

### Clone the repository

```bash
git clone https://github.com/AhlamS038/traffic-prediction-project.git
cd traffic-prediction-project
```

### Create virtual environment

```bash
python -m venv venv
```

### Activate environment

#### Windows
```bash
venv\Scripts\activate
```

#### Linux / macOS
```bash
source venv/bin/activate
```

### Install dependencies

```bash
pip install -r requirements.txt
```

### Run the application

```bash
python app.py
```

---

## Dataset

- Source: Kaggle
- Hourly traffic and weather data
- Target variable: `traffic_volume`

---

## Future Improvements

- Real-time traffic APIs
- Interactive dashboards
- REST API integration
- Mobile application
- LSTM / Prophet forecasting models

---

## License

This project is intended for educational and research purposes.
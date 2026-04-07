# SENTRA – AI Powered Women's Safety System

SENTRA is an **AI-driven proactive safety platform** designed to help women travel safely by combining **intelligent routing, real-time monitoring, and on-device threat detection**.

Unlike traditional safety apps that depend only on a **manual SOS button**, SENTRA continuously evaluates the surrounding environment and **guides users through safer routes while monitoring potential threats automatically**.

The system integrates **AI models, geospatial analysis, and sensor data** to detect risks and notify authorities in real time.

---

# 🚀 Key Features

## 🗺️ SafeNav – Intelligent Safe Routing

Traditional navigation apps optimize for **shortest distance or fastest time**.
SENTRA introduces **safety-aware routing**.

The system evaluates multiple routes and assigns a **safety score** based on environmental factors.

### Safety Score Calculation

* **Base Score:** Distance of route (shorter routes preferred)
* **Safety Bonus:** Segments near open businesses or crowded areas
* **Risk Penalty:** Segments passing through high-risk zones

The safest route is highlighted for the user.

---

## 🔋 Adaptive Polling – Smart Battery Optimization

Continuous monitoring can drain device battery. SENTRA solves this using **zone-based adaptive polling**.

| Zone Type       | Behavior                                            |
| --------------- | --------------------------------------------------- |
| **Green Zone**  | GPS updates every 5 minutes, monitoring disabled    |
| **Yellow Zone** | GPS updates every 1 minute, sensors on standby      |
| **Red Zone**    | Real-time GPS streaming and active threat detection |

This ensures **maximum safety with minimal battery usage**.

---

## 🎧 Sentinel Audio – AI Threat Detection

SENTRA includes an **on-device machine learning model** that detects potential threats using environmental audio.

The model detects sounds such as:

* Screaming
* Glass breaking
* Aggressive shouting

### Multimodal Threat Verification

To reduce false alarms, SENTRA verifies multiple signals before triggering alerts.

```python
if detect_scream(confidence > 0.85):
    if motion == "running" or motion == "violent_shaking":
        trigger_sos()
    else:
        vibrate_phone_warning()
```

All audio processing occurs **locally on the device**, ensuring **user privacy**.

---

## 📍 Algorithmic Geofencing

Instead of manually marking unsafe areas, SENTRA automatically identifies risk zones using clustering algorithms.

### Method Used

**DBSCAN (Density Based Spatial Clustering)**

### Input

* Historical incident reports
* Crowd density indicators
* Location patterns

### Output

Automatically generated **high-risk zones** displayed on the map.

---

# 🏗️ System Architecture

| Component       | Technology               | Responsibility                               |
| --------------- | ------------------------ | -------------------------------------------- |
| **Mobile App**  | Flutter / React Native   | UI, sensor data collection, TFLite inference |
| **Backend API** | Python (FastAPI / Flask) | Route scoring logic, zone management         |
| **Database**    | Firebase / Supabase      | Authentication, location sync, zone storage  |
| **ML Engine**   | TensorFlow Lite          | On-device audio threat detection             |
| **Dashboard**   | React.js / Next.js       | Monitoring alerts and incident visualization |

---

# 🧠 Core Technologies

* **Flutter / React Native**
* **Python FastAPI**
* **TensorFlow Lite**
* **Firebase / Supabase**
* **Mapbox / Google Maps API**
* **DBSCAN Clustering Algorithm**

---

# 📂 Project Structure

```
sentra/
│
├── mobile-app/
│   ├── ui/
│   ├── sensors/
│   └── navigation/
│
├── backend/
│   ├── api/
│   ├── routing-engine/
│   └── zone-clustering/
│
├── ml-models/
│   ├── audio-detection/
│   └── training-scripts/
│
├── dashboard/
│   ├── alerts/
│   └── heatmaps/
│
└── datasets/
```

---

# ⚙️ Installation

## Clone Repository

```bash
git clone https://github.com/yourusername/sentra.git
cd sentra
```

---

## Backend Setup

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

---

## Mobile App Setup

```bash
cd mobile-app
flutter pub get
flutter run
```

---

# 📊 Example Workflow

1. User starts navigation in the app.
2. SENTRA fetches multiple possible routes.
3. Each route is analyzed using **safety scoring logic**.
4. The safest route is suggested.
5. While travelling:

   * location updates are monitored
   * sensors activate in high-risk zones
6. If a threat is detected:

   * SOS alert is triggered
   * location is sent to the monitoring dashboard.

---

# 🔒 Privacy & Security

* All **audio analysis is performed on-device**
* No continuous recording or cloud storage of user audio
* Location data is encrypted and shared only during emergencies.

---

# 📈 Future Improvements

* Real crime dataset integration
* Crowd-sourced incident reporting
* Smart wearable integration
* AI-based video anomaly detection
* Predictive safety analytics using historical patterns
* Architecture diagram
* App UI screenshots
* Animated system flow diagram

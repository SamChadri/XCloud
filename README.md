🎵 XCloud – Online DAW with Step Sequencer

XCloud is a web-based Digital Audio Workstation (DAW) featuring a step sequencer, real-time synthesis, and project persistence with built-in versioning.
It combines Tone.js for audio, p5.js for visual/interactive UI, and a Node.js + SVN backend for saving project data.
Everything runs inside Docker with Nginx as the entrypoint.

🚀 Features

🎹 Step Sequencer built in the browser.

🎧 Tone.js: precise timing, synthesis, and audio scheduling.

🎨 p5.js: UI/graphics rendering for sequencer grid, controls, and interactive sketches.

🔄 Project Persistence with Versioning using SVN (Subversion).

🐳 Containerized Deployment with Docker + docker-compose.

🌐 Nginx Reverse Proxy for serving frontend & routing API calls.

🛠️ Technologies Used

Node.js
 → Backend, API, and communication with SVN.

Tone.js
 → Browser-based audio synthesis & step sequencer engine.

p5.js
 → UI and visualization layer (sequencer grid, interactive visuals).

Docker
 → Containerization and reproducible environments.

Nginx
 → Reverse proxy and static file serving.

Apache + SVN
 → Project persistence and version control.


Frontend: Runs in the browser, combining Tone.js (sound) + p5.js (graphics/UI).

Backend: Node.js handles API requests and commits project state to SVN.

Storage: SVN ensures version history for DAW projects.

Proxy: Nginx routes traffic and serves static assets.

📦 Installation & Running
1. Clone repo
git clone https://github.com/yourusername/XCloud.git
cd XCloud

2. Start containers
docker-compose up --build

3. Access app

Open browser → http://localhost:8080

💾 Saving & Loading Projects

Projects are serialized in JSON.

Node.js commits project files into an SVN repository.

Users can reload earlier versions thanks to SVN’s version control.

📊 Observations

p5.js enhances Tone.js by providing visual sequencing controls, making the DAW more intuitive.

Using SVN instead of a DB gives built-in history/version rollback, but requires more setup.

The entire stack is modular and portable thanks to Docker.

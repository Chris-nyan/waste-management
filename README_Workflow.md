Got it ✅
Here’s a GitHub workflow manual you can share with your teammate so both of you follow a structured, conflict-free development process:

⸻

📘 GitHub Workflow Manual

🔹 1. Branch Structure

We will use the following main branches:
	•	main → Production-ready, stable code.
	•	develop → Active development branch (where features are merged before release).
	•	feature/* → Feature-specific branches created from develop.
	•	release/* → Pre-release branch for final testing (optional).
	•	hotfix/* → Urgent bug fixes created from main.

⸻

🔹 2. Workflow Steps

Step 1: Clone the Repository

git clone <repo-url>
cd <repo-name>

Step 2: Always Update Local Branches

Before starting work:

git checkout develop
git pull origin develop

Step 3: Create a Feature Branch

Each feature or task should have its own branch:

git checkout -b feature/<feature-name>

🔹 Examples:
	•	feature/authentication
	•	feature/user-profile

Step 4: Commit Frequently
	•	Use small, meaningful commits.
	•	Follow this format:

feat: add user login API
fix: resolve profile image bug
docs: update README with setup guide
refactor: clean up auth controller

Step 5: Push Your Branch

git push origin feature/<feature-name>

Step 6: Create a Pull Request (PR)
	•	PR from feature/<feature-name> → develop
	•	Request review from the other developer.
	•	Address feedback and resolve conflicts.

Step 7: Merge to develop
	•	Only after approval.
	•	Never merge directly to main.

Step 8: Release

When ready for release:
	1.	Create release/<version> from develop.
	2.	Test & fix minor bugs.
	3.	Merge release/<version> → main and tag version.
	4.	Merge back into develop to keep sync.

Step 9: Hotfixes (Urgent Bugs)
	•	Create hotfix/<bug-name> from main.
	•	Fix, test, and merge back to both main and develop.

⸻

🔹 3. Rules to Follow

✅ Never commit directly to main or develop.
✅ Always pull the latest changes before starting work.
✅ Keep feature branches small and focused.
✅ Use clear commit messages.
✅ PR must be reviewed by at least one teammate before merging.

⸻

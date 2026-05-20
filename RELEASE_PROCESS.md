# Unified Release Process

This project uses a "hub-and-spoke" model for releases, powered by `semantic-release` and GitHub Actions. This ensures a consistent and automated workflow for versioning and deploying all parts of the monorepo.

## How It Works

The process is divided into two distinct phases:

1.  **The "Hub" (Versioning):** A central workflow creates a version number and Git tag.
2.  **The "Spokes" (Deployment):** Separate, specialized workflows listen for those tags and handle the actual building and deployment for each application type.

---

### 1. The "Hub": Creating a Release Version

-   **Trigger:** Pushing commits to `master`, `main`, `dev`, or `development`.
-   **Workflow:** `.templateScripts/workflows/release.yml` (This file is copied to `.github/workflows/` when you set up a project).
-   **Process:**
    1.  The workflow runs `semantic-release` at the root of the monorepo.
    2.  `semantic-release` analyzes all commit messages since the last release.
    3.  Based on the commit messages (e.g., `feat:`, `fix:`, `BREAKING CHANGE:`), it determines the next version number.
    4.  It updates the `version` in the root `package.json` and regenerates the `CHANGELOG.md`.
    5.  It creates a Git tag (e.g., `v1.2.0` for a main branch, `v1.2.1-dev.0` for a dev branch) and a corresponding GitHub Release with the changelog notes.
    6.  **Crucially, this workflow does not publish or deploy any code.** Its only job is to create the version tag.

---

### 2. The "Spokes": Deploying from a Tag

-   **Trigger:** A new tag matching the pattern `v*` is pushed to the repository.
-   **Workflows:** The individual workflows within each template (e.g., `publish-plugins.yml`, `deploy-webapp.yml`).
-   **Process:**
    1.  When the `release.yml` workflow successfully creates a new tag, it triggers all the specialized deployment workflows.
    2.  Each workflow inspects the tag to determine the correct action.

#### NPM Packages (`vite-plugin`, `vue-plugin`, `component-library`, `utils-library`)

-   **Workflow:** `publish-*.yml`
-   **Logic:**
    -   If the tag **does not** contain `-dev` (it's a full release), it will build and publish the package to the NPM registry under the `latest` tag.
    -   If the tag **does** contain `-dev`, the workflow **stops and does nothing**. Dev versions of plugins are not published.

#### Web App (`web-app`)

-   **Workflow:** `deploy-webapp.yml`
-   **Logic:**
    -   If the tag is a full release, it deploys the application to the **production** environment.
    -   If the tag is a pre-release (`-dev`), it deploys to the **staging** environment.
    -   *(Note: You must configure the environments and URLs in your GitHub repository settings and the workflow file.)*

#### Packaged Applications (`electron-app`, `browser-extension`)

-   **Workflows:** `release-electron.yml`, `release-extension.yml`
-   **Logic:**
    -   Builds the application and packages it into the appropriate format (executables, zip file, etc.).
    -   If the tag is a full release, it uploads the artifacts to the GitHub Release and marks it as the "Latest" release.
    -   If the tag is a pre-release (`-dev`), it uploads the artifacts and marks it as a "Pre-release".

---

## Your Role

Your only responsibility is to **write meaningful commit messages** following the [Conventional Commits specification](https://www.conventionalcommits.org/en/v1.0.0/). The automation will handle the rest.

HotWax Commerce Job Manager App

# Prerequisite

- Node `v22.12.0` or higher
- `pnpm`


# Build Notes (Users)

This app is developed and run from the [`accxui`](https://github.com/hotwax/accxui) pnpm workspace. It is not started by running commands inside this app folder directly.

1. Open a Terminal window.
2. Clone the workspace using the command: `git clone https://github.com/hotwax/accxui.git`
3. Go to the workspace root using command: `cd accxui`
4. Download the app from the [release](https://github.com/hotwax/job-manager/releases) page, extract it, and place it at `apps/job-manager`.
5. Create a `.env` file in `apps/job-manager` by taking reference from its `.env.example`.
6. Run following command from the `accxui` root to download dependencies  
    `pnpm install`
7. To run the app in browser use the command from the `accxui` root:  
    `pnpm --filter job-manager dev`


# Build Notes (Contributors)

1. Open a Terminal window.
2. Clone the workspace using the command: `git clone https://github.com/hotwax/accxui.git`
3. Go to the workspace root using command: `cd accxui`
4. Clone this app under `apps/` using the command:  
    `git clone https://github.com/hotwax/job-manager.git apps/job-manager`
5. Create a `.env` file in `apps/job-manager` by taking reference from its `.env.example`.
6. Run following command from the `accxui` root to download dependencies  
    `pnpm install`
7. To run the app in browser use the command from the `accxui` root:  
    `pnpm --filter job-manager dev`
8. To build the app use the command from the `accxui` root:  
    `pnpm --filter job-manager build`

Run `pnpm install` from the `accxui` root again whenever you add another app under `apps/`. See the [accxui README](https://github.com/hotwax/accxui/blob/main/README.md) for the full workspace guide.


# Contribution Guideline

1. Fork the repository and clone it locally from the `main` branch. Before starting your work make sure it's up to date with current `main` branch.
2. Pick an issue from [here](https://github.com/hotwax/job-manager/issues). Write in the issue comment that you want to pick it, if you can't assign yourself. **Please stay assigned to one issue at a time to not block others**.
3. Create a branch for your edits. Use the following branch naming conventions: **job-manager/issue-number**.
4. Please add issue number to your commit message.
5. Propose a Pull Request to `main` branch containing issue number and issue title.
6. Use [Pull Request template](https://github.com/hotwax/job-manager/blob/main/.github/PULL_REQUEST_TEMPLATE.md) (it's automatically added to each PR) and fill as much fields as possible to describe your solution.
7. Reference any relevant issues or other information in your PR.
8. Wait for review and adjust your PR according to it.
9. Congrats! Your PR should now be merged in!

If you can't handle some parts of the issue then please ask for help in the comment. If you have any problems during the implementation of some complex issue, feel free to implement just a part of it.

## Report a bug or request a feature

Always define the type of issue:
* Bug report
* Feature request

While writing issues, please be as specific as possible. All requests regarding support with implementation or application setup should be sent to.
    
    
# UI / UX Resources
You may find some useful resources for improving the UI / UX of the app <a href="https://www.figma.com/community/file/885791511781717756" target="_blank">here</a>.

# Join the community on Discord
If you have any questions or ideas feel free to join our <a href="https://discord.gg/S5zqNtJ9" target="_blank">Discord channel</a>
    
# The license

Job Manager app is completely free and released under the Apache v2.0 License. Check <a href="https://github.com/hotwax/job-manager/blob/main/LICENSE" target="_blank">LICENSE</a> for more details.

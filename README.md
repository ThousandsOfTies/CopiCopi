# CopiCopi

CopiCopi is a reference-and-drawing workspace. The app will present a source image or PDF on an A-side reference pane and a separate drawing canvas on a B-side workspace. The two panes do not need synchronized view state.

## Repository layout

This repository is the deployment and integration repository. Its source dependencies are standard Git submodules.

```text
repos/
├── drawing-common/        # Shared drawing library
├── home-teacher-common/   # Shared UI components
└── copicopi-app/          # CopiCopi application
```

The parent repository pins an exact commit for each submodule. There is no separate `VERSIONS` file.

## Setup

```bash
git clone --recurse-submodules https://github.com/ThousandsOfTies/CopiCopi.git
cd CopiCopi
make setup
```

For an existing checkout, initialize the pinned revisions with:

```bash
git submodule update --init --recursive
```

## Development

```bash
make dev        # Start the CopiCopi Vite server
make build      # Build shared code and the app
make status     # Show parent and submodule status
```

## Updating a submodule

Commit and push the change in its own repository first. Then, in this parent repository, update the submodule pointer and commit it:

```bash
cd repos/copicopi-app
git checkout main
git pull --ff-only

cd ../..
git add repos/copicopi-app
git commit -m "chore: update copicopi-app"
git push
```

`make update` moves all submodules to the branches specified in `.gitmodules`; review and commit the resulting gitlink changes before pushing.

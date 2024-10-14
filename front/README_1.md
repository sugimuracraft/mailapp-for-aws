# Description

# Development env with docker

```sh
docker compose build
docker compose up -d
```

connect running container `front-1`.

## install npm packages
The working directory is `/code` in the container, mapped from the project root `front/core`.

```

# Setup

## install @angular/cli
```bash
npm install @angular/cli
```

## generate app
```bash
ng new core --no-standalone --routing true --style scss --ssr false
ng new core --style scss --ssr false

? Would you like to share pseudonymous usage data about this project with the Angular Team
at Google under Google's Privacy Policy at https://policies.google.com/privacy. For more
details and how to change this setting, see https://angular.io/analytics. No

? Which stylesheet format would you like to use? SCSS

? Do you want to enable Server-Side Rendering (SSR) and Static Site Generation (SSG/Prerendering)? No
```

## generat login component
```bash
./node_modules/.bin/ng g c login
```

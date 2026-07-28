# FDO MoMEnT - The FAIR Digital Object Modular Minting & Enablement Toolkit

FDO MoMEnT is a Web app that allows the creation of FAIR Digital Objects (FAIR DO). This is done in a modular way by selecting 
from a list of templates defining metadata available in the resulting FAIR DO. For further customization, additional metadata
elements can be added as required to satisfy specific use cases or community needs. 

To ease the provisioning of metadata values, FAIR DO MoMEnT offers a multitude of Quality-of-Life features allowing the
(semi-)automatic acquisition of most standard metadata values. For immediate feedback on the impact of provided metadata,
a FAIR-Score indicator is shown giving the user a hint on how FAIR the resulting FAIR DO will be and how to improve 
the FAIR-Score.

## Configuration

FAIR DO MoMEnT is configured via `.env` file. You'll find an example in `env.example` showing all properties and potential
values. For testing purposes, you may use the in-memory variants of 'FDO_SERVICE_MODE' and 'DATABASE_TYPE', for production
it is strongly recommended to use a PostgreSQL database and a Typed PID Maker instance in order to create FAIR DOs 
that are persistently stored, have a globally unique identifier, and can be operated on outside FAIR DO MoMEnT. 

## Startup

While FAIR DO MoMEnT can be started like every other Next.js app, i.e., via `next run start`, it is recommended to use 
the Docker-based startup to run in a reproducible environment.

### Build and run as single Docker container

```bash
# 1. Pull the release image
docker pull ghcr.io/kit-data-manager/fdo-moment:v0.0.1

# 2. Run container interactively, mounting your environment files
docker run --rm -it \
  -v $(pwd)/.env:/app/.env \
  -v $(pwd)/next.config.js:/app/next.config.js \
  ghcr.io/kit-data-manager/fdo-moment:v0.0.1 \
  bash -c "npm run build && npm start"
```

### Include in docker-compose setup

```yaml
version: "3.8"

services:
  nextjs:
    image: ghcr.io/kit-data-manager/fdo-moment:v0.0.1
    ports:
      - "3000:3000"
    env_file:
      - .env
    volumes:
      - ./next.config.js:/app/next.config.js
    command: bash -c "npm run build && npm start"
```

## License

The KIT Data Manager is licensed under the Apache License, Version 2.0.

## Acknowledgements

This work has been supported by the research program [‘Engineering Digital Futures’](https://www.helmholtz.de/en/research/research-fields/information/engineering-digital-futures/) of the [Helmholtz Association of German Research Centers](https://www.helmholtz.de/en) and the [Helmholtz Metadata Collaboration Platform (HMC)](https://helmholtz-metadaten.de/).

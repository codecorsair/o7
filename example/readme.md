## o7 - bot self hosting guide

### Pre-requisites
- [Docker](https://docs.docker.com/get-docker/)
- [Docker Compose](https://docs.docker.com/compose/install/)
- [Git](https://git-scm.com/downloads)

### Setup
1. Clone the repository
    ```bash
    git clone <repo>
    ```
    ---
2. Copy the example configs

    > You can either edit the configs directly or use the environment variables in the docker-compose file (continue to step 5)
    ```bash
    cp example/configs/* configs/
    ```
    ---
3. Edit the configs
  
    > The important values are the `token` in `configs/bridge.json` and the `authToken` in `configs/bridge.json` and `configs/cluster.json`

    - **token** - The token of the bot account you want to use
    - **authToken** - The token to use for communication between the bridge and the cluster
    ---
4. Copy the example docker compose file
    ```bash
    cp example/docker-compose.yml docker-compose.yml
    ```
    ---
5. Edit the docker compose file
    > 
6. Start the bot
    ```bash
    docker-compose up -d
    ```
    ---
7. Invite the bot to your server
    ```curl
    https://discord.com/oauth2/authorize?client_id=<client_id>&scope=bot&permissions=3072
    ```
    ---


### Updating
1. Pull the latest changes
    ```bash
    git pull
    ```
    ---
2. Restart the bot
    ```bash
    docker-compose restart
    ```
    ---
### Troubleshooting
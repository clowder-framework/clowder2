## VS Code development

To run and debug the Clowder frontend and backend apps in VS Code IDE from the
WSL Ubuntu 24.04 LTS distribution

1.  Start VS Code, install the WSL (Windows Subsystem for Linux) extension,
    then exit

2.  Open Ubuntu 24.04 WSL terminal and clone the clowder2 repo

    ```
    git clone https://github.com/clowder-framework/clowder2.git
    cd clowder2
    ```

3.  Install NPM needed for building frontend

    ```
    sudo apt install npm
    ```

4.  Install frontend dependencies

    ```
    cd frontend
    npm install
    cd ..
    ```

5.  Install Python version needed for backend, eg.

    ```
    wget http://www.python.org/ftp/python/3.10.19/Python-3.10.19.tgz
    tar xzf Python-3.10.19.tgz
    mkdir $HOME/.local/python
    cd Python-3.10.19/
    ./configure --prefix=$HOME/.local/python
    make
    make install
    ```

6.  Create a Python virtualenv and install backend dependencies

    ```
    cd clowder2
    $HOME/.local/python/bin/python3 -m venv venv
    . venv/bin/activate
    pip install .
    deactivate
    ```

7.  Start local docker dependencies

    ```
    cd clowder2
    docker compose -f docker-compose.dev.yml -p clowder2-dev up -d
    # to stop use
    docker compose -p clowder2-dev down
    ```

8.  Add TCP proxy ports for forwarding Windows browser connections for the
    frontend, backend and Keycloak to WSL

    Get WSL IP address for `eth0` in WSL terminal

    ```
    ip -br a show dev eth0
    ```

    Add TCP proxy ports in PowerShell admin terminal

    ```
    netsh interface portproxy show v4tov4
    netsh interface portproxy add v4tov4 listenport=3000 listenaddress=0.0.0.0 connectport=3000 connectaddress=<eth0_ip>
    netsh interface portproxy add v4tov4 listenport=8000 listenaddress=0.0.0.0 connectport=8000 connectaddress=<eth0_ip>
    netsh interface portproxy add v4tov4 listenport=8080 listenaddress=0.0.0.0 connectport=8080 connectaddress=<eth0_ip>
    ```

9.  Start VS Code from your WSL terminal

    ```
    cd clowder2
    code .
    ```

10. Set the VS Code Python interpreter

    1. Open Command Palette (Ctrl+Shift+P)
    2. Click **Python: Select Interpreter** from list, set it to `./venv/bin/python`

11. Start Clowder backend in VS Code Run and Debug view

    1. Select **Python Debugger: FastAPI**
    2. Click **Start Debugging**

12. Start Clowder frontend in VS Code Run and Debug view

    1. Select **Launch via npm**
    2. Click **Start Debugging**

13. Open [Clowder](http://localhost:3000/) in your Windows Edge or Chrome browser

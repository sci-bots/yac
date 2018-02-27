<p align="center">
  <img alt="Yac!" width="150" src="https://raw.githubusercontent.com/sci-bots/yac/master/docs/images/textfx.png">
  <br/>
</p>

<p align="center">
  <b>A yarn-like package manager for any language.</b>
  <br><br>
  <img alt="Yac!" width="300" src="https://raw.githubusercontent.com/sci-bots/yac/master/docs/images/pexels-photo-671931.jpeg">
</p>


## Installation

```bash
# 1. Install yarn (if you intend to initialize your own yac projects)
npm i --global yarn

# 2. Install conda

# Linux (use a different link for 32 bit):
wget https://repo.continuum.io/miniconda/Miniconda2-latest-Linux-x86_64.sh -O ~/miniconda.sh
sudo bash ~/miniconda.sh -p $HOME/miniconda
export PATH="$HOME/miniconda/bin:$PATH"

# OSX
brew install wget
wget https://repo.continuum.io/miniconda/Miniconda2-latest-MacOSX-x86_64.sh -O ~/miniconda.sh
sudo bash ~/miniconda.sh -p $HOME/miniconda
export PATH="$HOME/miniconda/bin:$PATH"

# Windows 
# Download the installer from https://conda.io/miniconda.html

# 3. Install yac
yarn global add @yac/yac # or npm i --global @yac/yac
```

## Getting Started
```bash
yac --help
yac [command]

Commands:
  yac conda-info                           show active conda
  yac init                                 initialize a yac project
  yac install                              install dependencies
  yac exec <cmd>                           execute command inside yac environment
  yac add <packageName> [type]             add package through conda or pip
  yac remove <packageName> [type]          remove package through conda or pip
  yac dev <packageLocation> [packageName]  link local package
  yac undev <packageLocation>              unlink local package

Options:
  --help     Show help                                                 [boolean]
  --version  Show version number                                       [boolean]
  --cwd      change directory of execution                              [string]
```

## Dashboard

 You can launch processes in tracked yac packages similar to docker containers. The launch script should be specified in the "main" file of the yack projects' package.json. 
 
 ```
 yack dashboard
 ```
 <img alt="Dashboard" src="https://raw.githubusercontent.com/sci-bots/yac/master/docs/images/dashboard_design.PNG">

 

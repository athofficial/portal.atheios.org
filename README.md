# portal.atheios.org
Portal is the Atheios portal for the Atheios ecosystem. It can be installed on a plain installation of ubuntu 18.04.

# Installation
In order to run the portal sevaral components need to be installed:

## Install Mysql
```
  sudo apt update
  sudo apt install mysql-server
  sudo mysql_secure_installation 
```  

## Install Node JS, npm and git
```
  sudo apt install nodejs
  sudo apt install npm
  sudo apt install git
```  

## Clone the git repository
Clone git in Your local directory, or whereever the project root shall be.
```
  cd
  git clone https://github.com/athofficial/portal.atheios.org
```

Create the npm files needed for this instance
```
  npm install
```


## Setup configuration and database
Next go to the config directory and create a file with the configuration for the project.
```
  cd config
  vi config.production.json
```

The config file has the following syntax. Replace the password and user according to Your mysql installation.
```
{
  "connectionLimit": 10,
  "host": "localhost",
  "user": "root",
  "password": "my_password",
  "database": "gamedev",
  "multipleStatements": true,
  "timezone": "00:00",
  "httphost": "https://portal.atheios.org"
}
```

Next we need to create the database called gamedev. For that we go to the project root.
```
  cd ..
  mysqladmin -uroot -p create gamedev
  mysql -uroot -p gamedev < basedataset.sql
```

Finally we install PM2 and fire it up
```
  sudo npm install pm2@latest -g
  pm2 start ecosystem.config.js 
```

Now You can start the website with http://xxx.xxx.xxx.xxx:3002
It should look like this one: http://portal.atheios.org


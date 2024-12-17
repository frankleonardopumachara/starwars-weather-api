# Proyecto API RESTful con Node.js, AWS Lambda y Serverless Framework

El proyecto SWAPI implementa una API RESTful utilizando Node.js, desplegada en AWS Lambda usando **Serverless Framework**.

## Requisitos

1. **Node.js** (v20+)
2. **Serverless Framework**: [Instalar](https://www.serverless.com/framework/docs/getting-started/#installation)
3. **AWS CLI**: [Instalar](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html)
4. **Credenciales AWS** configuradas con `aws configure`.

## Despliegue

1. Clona el repositorio y navega a la carpeta del proyecto:
   ```bash
   git clone <URL_DEL_REPOSITORIO>
   cd <nombre_del_directorio>
   
2. Clona el repositorio y navega a la carpeta del proyecto:
   ```bash
   npm install

3. Despliega con Serverless Framework:
   ```bash
   sls deploy

4. Obtén la URL de la API desplegada:
   ```bash
   endpoints:
    GET - https://xxxxxxxxxx.execute-api.us-east-1.amazonaws.com/dev/fusionados
    POST - https://xxxxxxxxxx.execute-api.us-east-1.amazonaws.com/dev/almacenar
    GET - https://xxxxxxxxxx.execute-api.us-east-1.amazonaws.com/dev/historial

5. Obtén la URL de la API desplegada:
   ```bash
   sls remove

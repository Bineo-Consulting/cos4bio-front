# Cos4Bio - Expert Portal

## What is Cos4Cloud:

Cos4Cloud is H2020 European Project, and one of their service is a Platform that allow to the experts to Find, Access, Reuse and Interoperate with observations from differentes Citizen Observatories, following the FAIR rules in terms to integrate in the future in the best way in the EOSC environment. 

This software has been developed by Bineo Consulting SL.

## What are the Biodiversty CO envolved?

- ArtPortalen: https://www.artportalen.se/

- iSpot: https://www.ispotnature.org/

- Natusfera: https://natusfera.org 

- PlantNet: https://plantnet.org/

And we hope that in the near future more Biodiversity CO could integrate in this service.

## What are the Environmental CO envolved?

- OdourCollect: https://odourcollect.eu

- CanAir.oi: https://canair.io/


## How to deploy Cos4Cloud env. locally:

The first thing that you have to do is install docker, but what is docker? https://www.docker.com/why-docker 

Once you have installed this sotfware on your machine the only thing that you have to do is type the next commando inside the Cos4Cloud folder:

```docker-compose up```

and that's all 🙌

Now you can open your favourite browser and type: http://localhost:3333

and Enjoy!!

## Init with Firebase Framework
### front-end
```cd cos4cloud-frontend```
```npm start```

### backend
#### https://www.npmjs.com/package/firebase-tools
```cd cos4cloud```
```npm run f:start```

## Init with Raw Node
### front-end
```cd cos4cloud-frontend```
```HOST=http://localhost:10010/api npm start```

### backend
#### https://nodejs.org
```cd cos4cloud```
```node app```

## Licence

[GNU AGPLv3](https://choosealicense.com/licenses/agpl-3.0/)

This software has been developed by Bineo Consulting SL.

Permissions of this strongest copyleft license are conditioned on making available complete source code of licensed works and modifications, which include larger works using a licensed work, under the same license. Copyright and license notices must be preserved. Contributors provide an express grant of patent rights. When a modified version is used to provide a service over a network, the complete source code of the modified version must be made available.

[View full GNU Affero General Public License v3.0 »](https://github.com/Bineo-Consulting/cos4bio-front/blob/master/LICENSE)

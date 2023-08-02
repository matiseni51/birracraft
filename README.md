# Birracraft
> powered by Docker

### Description

Web application to manage the distribution of craft beer liters suplied to clients.
The project consists in a backend develop with _Django_ and a front-end in _ReactJS_. To serve this applications, a _PostgreSQL_ database & _NGINX_ service are used.
All of this is implemented through _Docker_ containers.
CI/CD pipelines are implemented with different GithHub features like actions, releases, container registry, variables, ...

### Deploy

To run the project just use the docker-compose file.
`$ docker-compose up --build -d`

> _Portainer_: The admin's credentials would be pre-set with the portainer_pass plaintext file


_docker-compose.override.yml_ is used to __development phase__.

* A SMTP service is implemented to test mailing features. Set correctly the variables on _.env_ file depending if you are going to be using this fake SMTP server or a real one.

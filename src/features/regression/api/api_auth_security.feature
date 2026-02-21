@regression @api @p0
Feature: API - Auth y seguridad basica

  Scenario: Login API invalido retorna 400
    When intento login API con credenciales invalidas
    Then el codigo de respuesta API es 400

  Scenario: Login valido y consulta de perfil por API
    Given inicio sesion por API como cliente
    Then la respuesta API incluye token y usuario
    When consulto por API mi perfil
    Then el codigo de respuesta API es 200
    And la respuesta API de perfil incluye email y rol

  Scenario: Perfil API requiere autenticacion
    Given no tengo token API
    When consulto por API mi perfil sin autenticacion
    Then el codigo de respuesta API es 401

  Scenario: Carrito requiere autenticacion
    Given no tengo token API
    When consulto por API el carrito sin autenticacion
    Then el codigo de respuesta API es 401

  Scenario: Endpoint admin de consultas requiere autenticacion
    Given no tengo token API
    When consulto por API el listado admin de consultas sin autenticacion
    Then el codigo de respuesta API es 401

  Scenario: Endpoint admin de consultas bloquea token cliente
    Given inicio sesion por API como cliente
    When consulto por API el listado admin de consultas con token cliente
    Then el codigo de respuesta API es 403


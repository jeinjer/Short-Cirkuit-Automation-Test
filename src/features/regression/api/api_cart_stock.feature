@regression @api @p1
Feature: API - Reglas de carrito

  Scenario: Carrito autenticado responde contrato base
    Given inicio sesion por API como cliente
    When consulto por API el carrito actual
    Then el codigo de respuesta API es 200
    And la respuesta API de carrito incluye summary

  Scenario: Vaciar carrito deja total en cero
    Given inicio sesion por API como cliente
    When limpio el carrito por API
    Then el codigo de respuesta API es 200
    And el carrito API queda vacio

  Scenario: Validacion de payload al agregar item sin productId
    Given inicio sesion por API como cliente
    When intento agregar item al carrito sin productId
    Then el codigo de respuesta API es 400

  Scenario: Validacion de payload al agregar item con cantidad invalida
    Given inicio sesion por API como cliente
    When intento agregar item al carrito con cantidad invalida
    Then el codigo de respuesta API es 400

  Scenario: No permite superar stock maximo al actualizar cantidad
    Given inicio sesion por API como cliente
    When intento actualizar cantidad de carrito por encima del stock
    Then el codigo de respuesta API es 400
    And la respuesta API indica error de stock maximo
    When limpio el carrito por API
    Then el codigo de respuesta API es 200

@regression @api @p1
Feature: API - Catalogo contratos

  Scenario: Listado de productos expone estructura paginada
    When consulto por API el listado de productos
    Then el codigo de respuesta API es 200
    And la respuesta API de productos incluye data y meta

  Scenario: SKU inexistente responde 404 controlado
    When consulto por API un SKU invalido
    Then el codigo de respuesta API es 404

  Scenario: Categorias expone name y count
    When consulto por API las categorias
    Then el codigo de respuesta API es 200
    And la respuesta API de categorias incluye name y count

  Scenario: Filtros dinamicos expone brands
    When consulto por API filtros dinamicos
    Then el codigo de respuesta API es 200
    And la respuesta API de filtros incluye brands

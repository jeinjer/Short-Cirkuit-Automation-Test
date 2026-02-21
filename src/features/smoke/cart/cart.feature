@smoke @p0 @auth_client @ui
Feature: Smoke - Carrito

  Scenario: Agregar producto al carrito
    Given estoy logueado como cliente
    And abro el catálogo
    When abro el primer producto con stock
    And agrego el producto al carrito
    Then veo el panel de carrito con el producto
@regression @p1 @ui @auth_client @clean_cart
Feature: Carrito - Cantidad

  Scenario: Incrementar cantidad actualiza items del carrito
    Given abro el catálogo
    When abro el primer producto con stock suficiente para incrementar
    And agrego el producto al carrito
    And abro el carrito
    And guardo cantidad e items actuales
    When incremento la cantidad del primer item
    Then la cantidad aumenta en 1
    And el total de items aumenta en 1


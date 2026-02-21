@regression @p1 @ui @auth_client @clean_cart
Feature: Carrito - Decremento

  Scenario: Decrementar cantidad reduce items y qty
    Given abro el catálogo
    When abro el primer producto con stock suficiente para incrementar
    And agrego el producto al carrito
    And abro el carrito
    And guardo cantidad e items actuales
    When incremento la cantidad del primer item
    Then la cantidad aumenta en 1
    And el total de items aumenta en 1
    When decremento la cantidad del primer item
    Then la cantidad vuelve a su valor anterior
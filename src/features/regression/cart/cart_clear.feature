@regression @p0 @ui @auth_client @clean_cart
Feature: Carrito - Vaciar

  Scenario: Vaciar carrito deja estado vacío
    Given abro el catálogo
    When abro el primer producto con stock
    And agrego el producto al carrito
    And vacío el carrito desde el panel
    Then veo el carrito vacío

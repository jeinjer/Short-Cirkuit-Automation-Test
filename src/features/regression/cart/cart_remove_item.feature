@regression @p1 @ui @auth_client @clean_cart
Feature: Carrito - Eliminar

  Scenario: Eliminar primer item del carrito reduce el total
    Given abro el catálogo
    When abro el primer producto con stock
    And agrego el producto al carrito
    And abro el carrito
    And guardo cantidad e items actuales
    When elimino el primer item del carrito
    Then el carrito queda vacío o el total de items disminuye

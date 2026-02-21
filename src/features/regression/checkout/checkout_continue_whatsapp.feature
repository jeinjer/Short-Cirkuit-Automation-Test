@regression @p0 @ui @auth_client @clean_cart
Feature: Checkout - Continuar

  Scenario: Luego de generar pedido, Continuar abre WhatsApp
    Given abro el catálogo
    When abro el primer producto con stock
    And agrego el producto al carrito
    And voy a checkout desde el carrito
    And genero el pedido
    When hago click en "Continuar"
    Then se abre WhatsApp o un enlace de WhatsApp
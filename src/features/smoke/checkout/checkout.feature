@smoke @p0 @ui @auth_client
Feature: Smoke - Checkout

  Scenario: Generar pedido y vaciar carrito
    Given estoy logueado como cliente
    And abro el catálogo
    And limpio el carrito si tiene items
    When agrego un producto con stock al carrito
    And voy a checkout desde el carrito
    And genero el pedido
    Then veo el ID del pedido y el botón Continuar
    And el carrito queda vacío
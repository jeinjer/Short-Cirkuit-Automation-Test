@regression @p1 @ui
Feature: Producto - SKU inexistente

  Scenario: SKU inválido muestra estado controlado
    Given navego a la ruta pública "/producto/sku-qa-inexistente"
    Then veo estado de producto no disponible o error controlado

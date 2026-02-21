@regression @p2 @ui @auth_admin
Feature: Producto - Sin stock (Admin)

  Scenario: Admin abre un producto sin stock y ve el estado
    Given abro el catálogo
    When abro un producto sin stock si existe
    Then veo el indicador "Sin stock" en el detalle
    And el botón "Agregar al carrito" no está disponible
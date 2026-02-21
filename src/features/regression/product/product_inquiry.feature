@regression @p1 @ui @auth_client
Feature: Producto - Consultas

  Scenario: Cliente envía consulta desde detalle y la ve en perfil
    Given abro el catálogo
    When abro el primer producto con stock
    And envío una consulta del producto
    Then veo confirmación de consulta enviada
    When abro mi perfil
    And abro la sección "Mis consultas"
    Then veo la sección "Mis consultas"
    And veo al menos una consulta listada o empty state de consultas

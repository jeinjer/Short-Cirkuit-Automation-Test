@regression @p0 @ui @auth_admin
Feature: Admin - Tabs

  Scenario: Navegar tabs del panel admin
    Given abro el panel de admin
    Then veo el panel de control con métricas y pestañas
    When abro la pestaña "Productos"
    Then veo contenido de la pestaña "Productos"
    When abro la pestaña "Consultas"
    Then veo contenido de la pestaña "Consultas"
    When abro la pestaña "Órdenes"
    Then veo contenido de la pestaña "Órdenes"
@regression @p0 @ui @auth_admin
Feature: Admin - Panel de control

  Scenario: Panel de admin carga y muestra tabs + métricas
    Given abro el panel de admin
    Then veo el panel de control con métricas y pestañas
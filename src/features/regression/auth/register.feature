@regression @p0 @ui
Feature: Registro

  Scenario: Registro exitoso inicia sesión
    Given abro la página de registro
    When registro un usuario nuevo válido
    Then veo el menú de usuario habilitado
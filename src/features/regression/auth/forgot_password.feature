@regression @p1 @ui
Feature: Auth - Forgot password

  Scenario: Solicitar recuperación de contraseña muestra confirmación
    Given abro la página de forgot password
    When solicito recuperar contraseña con un email válido
    Then veo confirmación de que se envió el email de recuperación
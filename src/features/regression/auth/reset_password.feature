@regression @p1 @ui
Feature: Auth - Reset password

  Scenario: Reset password exitoso vía email 
    Given solicito recuperación de contraseña para el usuario de prueba
    When obtengo el link de reset
    Then puedo restablecer la contraseña y loguearme con la nueva
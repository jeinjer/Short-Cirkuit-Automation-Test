@regression @p2 @ui
Feature: Header - Rutas Auth

  Scenario Outline: Header no se muestra en rutas de autenticación
    Given navego a la ruta pública "<ruta>"
    Then no veo el header principal

    Examples:
      | ruta             |
      | /login           |
      | /registro        |
      | /forgot-password |
      | /reset-password  |

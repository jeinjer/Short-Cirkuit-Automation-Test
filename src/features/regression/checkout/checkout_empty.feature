@regression @p0 @ui @auth_client
Feature: Checkout - Estados inválidos

  Scenario: Checkout sin items no permite generar pedido
    Given abro checkout directamente
    Then no puedo generar un pedido sin productos
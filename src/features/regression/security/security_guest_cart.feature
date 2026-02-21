@regression @p0 @ui
Feature: Seguridad - Carrito

  Scenario: Invitado no ve botón Agregar al carrito
    Given abro el catálogo
    When abro el primer producto del listado
    Then no debo ver el botón "Agregar al carrito"
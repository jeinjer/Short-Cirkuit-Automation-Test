@regression @p2 @ui
Feature: Footer - WhatsApp

  Scenario: Home muestra al menos dos enlaces de WhatsApp
    Given estoy en la home
    Then veo enlaces de WhatsApp en el footer

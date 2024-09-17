package scenarios

import config.BaseHelpers._
import io.gatling.core.Predef._
import io.gatling.core.structure._
import io.gatling.http.Predef._

object AppDemo {

  def scnAppDemo: ScenarioBuilder = {
    scenario("Add table to Cart")
      .exec(flushHttpCache)
      .exec(flushCookieJar)
      .exitBlockOnFail(
        group("Open home Page") {
          exec(api.home.appHome())
            .exec(thinkTimer())
        }

          .group("Open tables category") {
            exec(api.category.openTablesCategory())
              .exec(thinkTimer())
          }

          .group("Open table product") {
            exec(api.product.openTableProductPage("#{randomProductLink}"))
              .exec(thinkTimer())
          }
          .group("Add to Cart") {
            exec(api.product.addProductToCart("#{randomProductNumber}"))
              .exec(thinkTimer())
          }
          .randomSwitch(
            50.0 ->
              group("Add chair to cart") {
                exec(api.category.openChairsCategory())
                  .exec(thinkTimer())
                exec(api.product.openChairProduct("#{randomProductLink}"))
                  .exec(thinkTimer())
                exec(api.product.addProductToCart("#{randomProductNumber}"))
                  .exec(thinkTimer())
              }
          )

          .randomSwitch(
            30.0 ->
              group("Place an order") {
                exec(api.cart.openCart())
                  .exec(thinkTimer())
                exec(api.CheckoutPage.openCheckout())
                  .exec(thinkTimer())
                exec(api.CheckoutPage.placeAnOrder()
                )
                  .exec(thinkTimer())
              }
          )


      )
  }

}

/* eslint-disable */
import axios from 'axios';
import { showAlert } from './alert';
//  
const stripe = Stripe(
  'pk_test_51PjUxjIl1ZV2VKxuutJCmkqKoNPU1p0DAZcnZKxE6fvg6VLhcxGboLGS03HSKCX1CPyLrSmRUcn7VltNzyd1TkOG00PGd2CswR',
);

export const bookTour = async (tourId) => {
  try {
    const session = await axios(
      `/api/v1/bookings/checkout-session/${tourId}`,
    );
    console.log(session);

    await stripe.redirectToCheckout({
      sessionId: session.data.session.id,
    });
  } catch (err) {
    console.log(err, 'stripe is not defined');
    showAlert('error', err);
  }
};

import ReactGA from "react-ga4";

export const initAnalytics = () => {
    ReactGA.initialize("G-M0X0FEV1NV");
};

export const trackPageView = (path) => {
    ReactGA.send({
        hitType: "pageview",
        page: path
    });
};

export const trackEvent = (category, action, label) => {
    ReactGA.event({
        category,
        action,
        label
    });
};

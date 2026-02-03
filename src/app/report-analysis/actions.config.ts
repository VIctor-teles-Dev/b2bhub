/*
    Configuration for Report Analysis Scraping
 */
export const CONFIG = {
    
     /* Maximum number of reports processed simultaneously.
     */
    PARALLEL_LIMIT: 100,

    /*
      Maximum retry attempts per report on failure.
     */
    MAX_RETRIES: 3,

    /*
      Base delay between retries in milliseconds.
     */
    RETRY_DELAY: 2000,
};

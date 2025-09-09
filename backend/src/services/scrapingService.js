// services/scrapingService.js
const puppeteer = require('puppeteer');
const axios = require('axios');

class ScrapingService {
    constructor() {
        this.apiClients = {
            usa: {
                samGov: axios.create({
                    baseURL: 'https://api.sam.gov',
                    headers: { 'X-Api-Key': process.env.SAM_GOV_API_KEY }
                })
            },
            uk: {
                ted: axios.create({
                    baseURL: 'https://ted.europa.eu/api'
                })
            }
        };
    }

    async scrapeTenders(country) {
        switch (country.toLowerCase()) {
            case 'usa':
                return await this.scrapeUSATenders();
            case 'uk':
                return await this.scrapeUKTenders();
            case 'singapore':
                return await this.scrapeSingaporeTenders();
            default:
                throw new Error(`Scraping not implemented for ${country}`);
        }
    }

    async scrapeUSATenders() {
        try {
            // Use SAM.gov API
            const response = await this.apiClients.usa.samGov.get('/opportunities/v2/search', {
                params: {
                    api_key: process.env.SAM_GOV_API_KEY,
                    limit: 100,
                    postedFrom: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
                }
            });
            
            return response.data.opportunitiesData.map(this.transformUSATender);
        } catch (error) {
            console.error('Error scraping USA tenders:', error);
            return [];
        }
    }

    async scrapeUKTenders() {
        // Use TED API or scrape Contracts Finder
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        
        try {
            await page.goto('https://www.contractsfinder.service.gov.uk/Search');
            
            // Implement scraping logic for UK tenders
            const tenders = await page.evaluate(() => {
                // Extract tender data from page
                return Array.from(document.querySelectorAll('.search-result')).map(el => ({
                    title: el.querySelector('h2')?.textContent?.trim(),
                    description: el.querySelector('.description')?.textContent?.trim(),
                    // ... more fields
                }));
            });
            
            return tenders.map(this.transformUKTender);
        } finally {
            await browser.close();
        }
    }

    transformUSATender(tender) {
        return {
            title: tender.title,
            description: tender.description,
            country: 'USA',
            budget: tender.award?.amount || null,
            deadline: tender.responseDeadLine,
            category: tender.classificationCode,
            requirements: tender.naicsCode ? [tender.naicsCode] : [],
            source_url: tender.uiLink,
            source_api: 'sam_gov'
        };
    }

    transformUKTender(tender) {
        return {
            title: tender.title,
            description: tender.description,
            country: 'UK',
            budget: null, // Extract from description if available
            deadline: tender.deadline,
            category: tender.category,
            requirements: [],
            source_url: tender.url,
            source_api: 'contracts_finder'
        };
    }
}

module.exports = ScrapingService;
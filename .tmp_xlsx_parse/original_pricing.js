const PRICING_CONFIG = {
    TRADITIONAL: {
        BASE_PRICE: 5,
        MIN_COST: 3000
    },
    ONLINE: {
        get BASE_PRICE() { return PRICING_CONFIG.TRADITIONAL.BASE_PRICE * 1.3; },
        get MIN_COST() { return PRICING_CONFIG.TRADITIONAL.MIN_COST * 1.3; }
    },
    DISTRICT_MIN: 6000,
    PRICING_TIERS: [
        { range: '120,000+', min: 120000, max: Infinity, startRatio: 0.484375, endRatio: 0.484375 },
        { range: '60,000-119,999', min: 60000, max: 119999, startRatio: 0.515625, endRatio: 0.484375 },
        { range: '30,000-59,999', min: 30000, max: 59999, startRatio: 0.539063, endRatio: 0.515625 },
        { range: '15,000-29,999', min: 15000, max: 29999, startRatio: 0.554688, endRatio: 0.539063 },
        { range: '7,500-14,999', min: 7500, max: 14999, startRatio: 0.570313, endRatio: 0.554688 },
        { range: '5,000-7,499', min: 5000, max: 7499, startRatio: 0.601563, endRatio: 0.570313 },
        { range: '2,500-4,999', min: 2500, max: 4999, startRatio: 0.656250, endRatio: 0.601563 },
        { range: '1,500-2,499', min: 1500, max: 2499, startRatio: 0.718750, endRatio: 0.656250 },
        { range: '1,200-1,499', min: 1200, max: 1499, startRatio: 0.804688, endRatio: 0.718750 },
        { range: '750-1,199', min: 750, max: 1199, startRatio: 0.914063, endRatio: 0.804688 },
        { range: '600-749', min: 600, max: 749, startRatio: 1.0, endRatio: 0.914063 }
    ]
};

class ProductPricingCalculator {
    constructor() {
        this.config = PRICING_CONFIG;
    }

    validateInputs(studentCount, isOnline, isDistrict, years) {
        if (typeof studentCount !== 'number') throw new Error('Student count must be a number');
        if (!Number.isFinite(studentCount)) throw new Error('Student count must be a finite number');
        if (studentCount < 0) throw new Error('Student count cannot be negative');
        if (!Number.isInteger(studentCount)) throw new Error('Student count must be a whole number');
        if (typeof years !== 'number') throw new Error('Years must be a number');
        if (!Number.isInteger(years)) throw new Error('Years must be a whole number');
        if (years < 1) throw new Error('Years must be at least 1');
        if (years > 5) throw new Error('Maximum license duration is 5 years');
    }

    safeMultiply(a, b) {
        const factor = 100;
        const aInt = Math.round(a * factor);
        const bInt = Math.round(b * factor);
        return (aInt * bInt) / (factor * factor);
    }

    getBasePrice(isOnline) {
        return isOnline ? this.config.ONLINE.BASE_PRICE : this.config.TRADITIONAL.BASE_PRICE;
    }

    getMinimumCost(isOnline, isDistrict) {
        const baseMinimum = isOnline ? this.config.ONLINE.MIN_COST : this.config.TRADITIONAL.MIN_COST;
        return isDistrict ? Math.max(baseMinimum, this.config.DISTRICT_MIN) : baseMinimum;
    }

    calculateLicenseForProduct(studentCount, isOnline, isDistrict, years) {
        const basePrice = this.getBasePrice(isOnline);
        const minimumCost = this.getMinimumCost(isOnline, isDistrict);
        const rawLicense = Math.ceil(this.safeMultiply(studentCount, basePrice));
        const baseLicense = Math.max(rawLicense, minimumCost);
        const totalLicense = this.safeMultiply(baseLicense, years);
        return { basePrice, minimumCost, rawLicense, baseLicense, totalLicense };
    }

    calculateVolumeDiscount(studentCount, basePrice, years) {
        if (studentCount < 500) {
            return { discountRatio: 0, pricePerStudent: basePrice, volumeDiscount: 0, tier: null };
        }

        const tier = this.config.PRICING_TIERS.find(t => studentCount >= t.min && studentCount <= t.max);
        if (!tier) throw new Error('Unable to determine pricing tier');

        const tierRange = tier.max - tier.min;
        const progress = tierRange === 0 ? 0 : (studentCount - tier.min) / tierRange;
        const ratioRange = tier.endRatio - tier.startRatio;
        const discountRatio = tier.startRatio + (ratioRange * progress);

        const pricePerStudent = this.safeMultiply(basePrice, discountRatio);
        const discountPerStudent = basePrice - pricePerStudent;
        const rawVolumeDiscount = Math.ceil(this.safeMultiply(studentCount, discountPerStudent));
        const volumeDiscount = -(this.safeMultiply(rawVolumeDiscount, years));

        return { discountRatio, pricePerStudent, volumeDiscount, tier: tier.range };
    }

    calculateMultiProductDiscount(subtotal, selectedProducts) {
        const productCount = Object.values(selectedProducts).filter(Boolean).length;
        return productCount > 1 ? -Math.round(subtotal * 0.10) : 0;
    }

	calculateImplementationFee(singleYearSubtotal, isFirstYear, selectedProducts) {
		if (!isFirstYear) return 0;
		
		// Count how many products are selected
		const productCount = Object.values(selectedProducts).filter(Boolean).length;
		
		// For fair comparison, normalize the subtotal as if only one product was selected
		// This prevents the fee from increasing just because two products were selected
		const normalizedSubtotal = productCount > 1 ? singleYearSubtotal / productCount : singleYearSubtotal;
		
		if (normalizedSubtotal < 6000) {
			return 1450;
		} else if (normalizedSubtotal <= 20000) {
			return 1950;
		} else {
			return 2950;
		}
	}

    calculateMultiYearDiscount(subtotal, years) {
        if (years <= 1) return 0;
        const discount = years === 3 ? 0.05 : 0.10;
        return -Math.round(this.safeMultiply(subtotal, discount));
    }

    calculateTotal(studentCount, isOnline, isDistrict, years, isFirstYear, selectedProducts) {
        try {
            const sanitizedInputs = {
                studentCount: parseInt(studentCount, 10),
                isOnline: Boolean(isOnline),
                isDistrict: Boolean(isDistrict),
                years: parseInt(years, 10),
                isFirstYear: Boolean(isFirstYear)
            };

            this.validateInputs(
                sanitizedInputs.studentCount,
                sanitizedInputs.isOnline,
                sanitizedInputs.isDistrict,
                sanitizedInputs.years
            );

            const products = {};
            let totalVolumeDiscount = 0;
            let totalLicense = 0;

            // Calculate single year amounts first
            for (const product of ['engagementBuilder', 'communityBuilder']) {
                if (selectedProducts[product]) {
                    const licenseDetails = this.calculateLicenseForProduct(
                        sanitizedInputs.studentCount,
                        sanitizedInputs.isOnline,
                        sanitizedInputs.isDistrict,
                        1  // Always calculate for 1 year first
                    );

                    const discountDetails = this.calculateVolumeDiscount(
                        sanitizedInputs.studentCount,
                        licenseDetails.basePrice,
                        1  // Always calculate for 1 year first
                    );

                    products[product] = {
                        license: licenseDetails.totalLicense,
                        volumeDiscount: discountDetails.volumeDiscount,
                        details: { ...licenseDetails, ...discountDetails }
                    };

                    totalVolumeDiscount += discountDetails.volumeDiscount;
                    totalLicense += licenseDetails.totalLicense;
                }
            }

            // Calculate single year subtotal first
            const singleYearSubtotal = totalLicense + totalVolumeDiscount;
            
            // Calculate implementation fee based on single year subtotal
				const implementationFee = this.calculateImplementationFee(
					singleYearSubtotal, 
					sanitizedInputs.isFirstYear,
					selectedProducts  // Pass the selectedProducts parameter
				);
            
            // Now apply the years multiplier to license and volume discount
            totalLicense *= sanitizedInputs.years;
            totalVolumeDiscount *= sanitizedInputs.years;
			
			for (const product of ['engagementBuilder', 'communityBuilder']) {
				if (products[product]) {
					products[product].license *= sanitizedInputs.years;
					products[product].volumeDiscount *= sanitizedInputs.years;
				}
			}
            
            const baseSubtotal = totalLicense + totalVolumeDiscount;
            const multiProductDiscount = this.calculateMultiProductDiscount(baseSubtotal, selectedProducts);
            const multiYearDiscount = this.calculateMultiYearDiscount(baseSubtotal, sanitizedInputs.years);
            const subtotalWithDiscounts = baseSubtotal + multiProductDiscount + multiYearDiscount;
            
            const grandTotal = subtotalWithDiscounts + implementationFee;

            return {
                products,
                totalVolumeDiscount,
                baseSubtotal,
                multiProductDiscount,
                implementationFee,
                multiYearDiscount,
                grandTotal,
                error: null
            };
        } catch (error) {
            return {
                products: {},
                totalVolumeDiscount: 0,
                baseSubtotal: 0,
                multiProductDiscount: 0,
                implementationFee: 0,
                multiYearDiscount: 0,
                grandTotal: 0,
                error: error.message
            };
        }
    }
}

class ProductDisplayManager {
    constructor(calculator) {
        this.calculator = calculator;
        this.initializeElements();
        this.initializeErrorDisplay();
        this.initializeDividers();
        this.handlePricingUpdate = this.debounce(this.handlePricingUpdate.bind(this), 100);
    }

    debounce(func, wait) {
        let timeout;
        return (...args) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), wait);
        };
    }

    initializeElements() {
        this.studentCountInput = document.getElementById('studentCount');
        this.schoolTypeRadios = document.getElementsByName('schoolType');
        this.schoolDistrictCheckbox = document.getElementById('schoolDistrictCheckbox');
        this.isFirstYearCheckbox = document.getElementById('isFirstYear');
        this.yearsSelect = document.getElementById('yearsSelect');
        this.schoolNameInput = document.getElementById('schoolName');
        this.notesInput = document.getElementById('notes');
        this.engagementBuilderCheckbox = document.getElementById('engagementBuilder');
        this.communityBuilderCheckbox = document.getElementById('communityBuilder');
        this.schoolNameDisplay = document.getElementById('schoolNameDisplay');
        this.resultDiv = document.getElementById('result');
        this.engagementBuilderRow = document.getElementById('engagementBuilderRow');
        this.communityBuilderRow = document.getElementById('communityBuilderRow');
        this.volumeDiscountRow = document.getElementById('volumeDiscountRow');
        this.subtotalRow = document.getElementById('subtotalRow');
        this.additionalItemsGroup = document.getElementById('additionalItemsGroup');
        this.customItemsContainer = document.getElementById('customItemsContainer');
        this.notesDisplay = document.getElementById('notesDisplay');
        this.openNewBtn = document.getElementById('openNewBtn');
        this.copyLinkBtn = document.getElementById('copyLinkBtn');
        this.itemsContainer = document.getElementById('itemsContainer');

        const templateDiv = document.querySelector('.custom-item');
        if (templateDiv) {
            templateDiv.remove();
            this.customItemTemplate = templateDiv.outerHTML;
        } else {
            console.error('Custom item template not found');
        }
        
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        this.studentCountInput.addEventListener('input', () => this.handlePricingUpdate());
        this.schoolTypeRadios.forEach(radio => 
            radio.addEventListener('change', () => this.handlePricingUpdate())
        );
        this.schoolDistrictCheckbox.addEventListener('change', () => this.handlePricingUpdate());
        this.isFirstYearCheckbox.addEventListener('change', () => this.handlePricingUpdate());
        this.yearsSelect.addEventListener('change', () => this.handlePricingUpdate());
        this.engagementBuilderCheckbox.addEventListener('change', () => this.handlePricingUpdate());
        this.communityBuilderCheckbox.addEventListener('change', () => this.handlePricingUpdate());

        this.schoolNameInput.addEventListener('input', () => {
            const displayValue = this.schoolNameInput.value.trim() || 'Enter School Details';
            this.schoolNameDisplay.textContent = displayValue;
            this.updateOpenButtonState();
            this.handlePricingUpdate();
        });

        this.notesInput.addEventListener('input', () => {
            this.notesDisplay.textContent = this.notesInput.value;
            this.notesDisplay.style.display = this.notesInput.value.trim() ? 'block' : 'none';
        });

        const addItemBtn = document.getElementById('addItemBtn');
        if (addItemBtn) {
            addItemBtn.addEventListener('click', () => this.addCustomItem());
        }

        if (this.openNewBtn) {
            this.openNewBtn.addEventListener('click', () => this.openInNewTab());
        }

        if (this.copyLinkBtn) {
            this.copyLinkBtn.addEventListener('click', () => this.copyLinkToClipboard());
        }
    }

    initializeErrorDisplay() {
        if (!document.getElementById('calculatorError')) {
            const errorDiv = document.createElement('div');
            errorDiv.id = 'calculatorError';
            errorDiv.className = 'error-message';
            errorDiv.style.display = 'none';
            errorDiv.setAttribute('role', 'alert');
            errorDiv.setAttribute('aria-live', 'polite');
            this.resultDiv.parentNode.insertBefore(errorDiv, this.resultDiv);
        }
        this.errorDisplay = document.getElementById('calculatorError');
    }

    initializeDividers() {
        if (!document.getElementById('firstGroupDivider')) {
            const firstGroupDivider = document.createElement('div');
            firstGroupDivider.id = 'firstGroupDivider';
            firstGroupDivider.className = 'divider';
            firstGroupDivider.setAttribute('role', 'separator');
            this.subtotalRow.parentNode.insertBefore(firstGroupDivider, this.subtotalRow);
        }
    }

updateOpenButtonState() {
        const hasSchoolName = this.schoolNameInput.value.trim() !== '';
        this.openNewBtn.disabled = !hasSchoolName;
        this.openNewBtn.setAttribute('aria-disabled', (!hasSchoolName).toString());
        this.copyLinkBtn.disabled = !hasSchoolName;
        this.copyLinkBtn.setAttribute('aria-disabled', (!hasSchoolName).toString());
    }

    showError(message) {
        this.errorDisplay.textContent = message;
        this.errorDisplay.style.display = 'block';
        this.resultDiv.style.display = 'none';
        setTimeout(() => this.hideError(), 5000);
    }

    hideError() {
        this.errorDisplay.style.display = 'none';
        this.errorDisplay.textContent = '';
        this.resultDiv.style.display = 'flex';
    }

    formatCurrency(amount) {
        const roundedAmount = Math.ceil(amount);
        const isNegative = roundedAmount < 0;
        const formattedNumber = Math.abs(roundedAmount).toLocaleString();
        return isNegative ? `-$${formattedNumber}` : `$${formattedNumber}`;
    }

    getSelectedSchoolType() {
        return Array.from(this.schoolTypeRadios).find(radio => radio.checked)?.value;
    }

    addCustomItem() {
        const customItem = document.createElement('div');
        customItem.className = 'custom-item';
        customItem.innerHTML = `
            <input class="item-name" autocomplete="off" type="text" placeholder="Item name">
            <div class="item-controls">
                <select class="type-select">
                    <option selected value="discount">Discount</option>
                    <option value="addon">Add-on</option>
                </select>
                <select class="calc-select">
                    <option selected value="percent">Percent</option>
                    <option value="fixed">Fixed Price</option>
                </select>
                <input class="amount" min="0" step="0.01" type="number" placeholder="Amount">
                <button type="button" class="delete-button" aria-label="Delete item">
                    <i class="fas fa-trash-alt" aria-hidden="true"></i>
                    <span class="sr-only">Delete item</span>
                </button>
            </div>
        `;
        
        const deleteBtn = customItem.querySelector('.delete-button');
        deleteBtn.addEventListener('click', (e) => {
            e.target.closest('.custom-item').remove();
            this.handlePricingUpdate();
        });

        const inputs = customItem.querySelectorAll('input, select');
        inputs.forEach(input => {
            input.addEventListener('change', () => this.handlePricingUpdate());
            input.addEventListener('input', () => this.handlePricingUpdate());
        });

        this.itemsContainer.appendChild(customItem);
    }

    calculateCustomItems(baseSubtotal) {
        return Array.from(this.itemsContainer.querySelectorAll('.custom-item')).map(item => {
            const name = item.querySelector('.item-name').value || 'Custom Item';
            const type = item.querySelector('.type-select').value;
            const calcType = item.querySelector('.calc-select').value;
            const amount = parseFloat(item.querySelector('.amount').value) || 0;
            
            let value;
            if (calcType === 'percent') {
                value = (baseSubtotal * amount / 100);
            } else {
                value = amount;
            }
            if (type === 'discount') {
                value = -value;
            }
            
            return { name, value };
        });
    }

    handlePricingUpdate() {
        this.hideError();
        this.resultDiv.style.display = 'flex';

        try {
            const students = parseInt(this.studentCountInput.value);
            const isOnline = this.getSelectedSchoolType() === 'online';
            const isDistrict = this.schoolDistrictCheckbox.checked;
            const years = parseInt(this.yearsSelect.value);
            const isFirstYear = this.isFirstYearCheckbox.checked;

            const selectedProducts = {
                engagementBuilder: this.engagementBuilderCheckbox.checked,
                communityBuilder: this.communityBuilderCheckbox.checked
            };

            if (!selectedProducts.engagementBuilder && !selectedProducts.communityBuilder) {
                throw new Error('Please select at least one product');
            }

            const pricing = this.calculator.calculateTotal(
                students,
                isOnline,
                isDistrict,
                years,
                isFirstYear,
                selectedProducts
            );

            if (pricing.error) {
                this.showError(pricing.error);
                return;
            }

            const customItems = this.calculateCustomItems(pricing.baseSubtotal);
            const customItemsTotal = customItems.reduce((sum, item) => sum + item.value, 0);

            const finalPricing = {
                ...pricing,
                customItemsTotal,
                grandTotal: pricing.grandTotal + customItemsTotal
            };

            this.updateDisplay(finalPricing, customItems);
        } catch (error) {
            this.showError(error.message || 'An error occurred while calculating the price');
        }
    }

    updateLicenseSection(pricing) {
        const studentCount = parseInt(this.studentCountInput.value) || 0;
        const studentText = `(${studentCount.toLocaleString()} students)`;

        if (pricing.products.engagementBuilder) {
            this.engagementBuilderRow.style.display = 'flex';
            this.engagementBuilderRow.querySelector('.label').textContent = 
                `Engagement Builder License ${studentText}:`;
            this.engagementBuilderRow.querySelector('.total').textContent = 
                this.formatCurrency(pricing.products.engagementBuilder.license);
        } else {
            this.engagementBuilderRow.style.display = 'none';
        }

        if (pricing.products.communityBuilder) {
            this.communityBuilderRow.style.display = 'flex';
            this.communityBuilderRow.querySelector('.label').textContent = 
                `Community Builder License ${studentText}:`;
            this.communityBuilderRow.querySelector('.total').textContent = 
                this.formatCurrency(pricing.products.communityBuilder.license);
        } else {
            this.communityBuilderRow.style.display = 'none';
        }

        if (pricing.totalVolumeDiscount !== 0) {
            this.volumeDiscountRow.style.display = 'flex';
            const totalLicense = Object.values(pricing.products).reduce((sum, product) => 
                sum + product.license, 0);
            const discountPercentage = Math.abs(Math.round((pricing.totalVolumeDiscount / totalLicense) * 100));
            this.volumeDiscountRow.querySelector('.label').textContent = 
                `Volume Discount (${discountPercentage}%):`;
            this.volumeDiscountRow.querySelector('.total').textContent = 
                this.formatCurrency(pricing.totalVolumeDiscount);
        } else {
            this.volumeDiscountRow.style.display = 'none';
        }

        this.subtotalRow.querySelector('.total').textContent = 
            this.formatCurrency(pricing.baseSubtotal);
    }

    updateAdditionalItems(pricing, customItems) {
        const hasImplementationFee = pricing.implementationFee > 0;
        const hasMultiProductDiscount = pricing.multiProductDiscount < 0;
        const hasMultiYearDiscount = pricing.multiYearDiscount < 0;
        const hasCustomItems = customItems.length > 0;

        this.additionalItemsGroup.style.display = 
            (hasImplementationFee || hasMultiProductDiscount || hasMultiYearDiscount || hasCustomItems) 
            ? 'flex' : 'none';

        this.customItemsContainer.innerHTML = '';

        // Separate items into add-ons and discounts
        const addOns = [];
        const discounts = [];

        if (hasImplementationFee) {
            addOns.push({
                name: 'Implementation Fee',
                value: pricing.implementationFee
            });
        }

        customItems.forEach(item => {
            if (item.value >= 0) {
                addOns.push(item);
            } else {
                discounts.push(item);
            }
        });

        if (hasMultiProductDiscount) {
            discounts.push({
                name: 'Multi-product Discount (10%)',
                value: pricing.multiProductDiscount
            });
        }

        if (hasMultiYearDiscount) {
            const years = parseInt(this.yearsSelect.value);
            const percentageText = years === 3 ? '(5%)' : '(10%)';
            discounts.push({
                name: `Multi-year Discount ${percentageText}`,
                value: pricing.multiYearDiscount
            });
        }

        // Add add-ons first
        addOns.forEach(item => this.addItemRow(item.name, item.value));

        // Then add discounts, sorted by absolute value
        discounts
            .sort((a, b) => Math.abs(b.value) - Math.abs(a.value))
            .forEach(item => this.addItemRow(item.name, item.value, true));
    }

    addItemRow(label, value, isDiscount = false) {
        const row = document.createElement('div');
        row.className = 'result-row';
        row.innerHTML = `
            <span class="label">${label}:</span>
            <span class="total${isDiscount ? ' discount' : ''}">${this.formatCurrency(value)}</span>
        `;
        this.customItemsContainer.appendChild(row);
    }

    updateDisplay(pricing, customItems) {
        this.updateLicenseSection(pricing);
        this.updateAdditionalItems(pricing, customItems);

        const grandTotalElement = document.querySelector('.grand-total .total');
        if (grandTotalElement) {
            grandTotalElement.textContent = this.formatCurrency(pricing.grandTotal);
        }

        this.updateNotes();
    }

    updateNotes() {
        if (!this.notesDisplay) return;
        
        const notes = this.notesInput.value.trim();
        this.notesDisplay.style.display = notes ? 'block' : 'none';
        this.notesDisplay.textContent = notes;
    }

    async copyLinkToClipboard() {
        try {
            const params = this.buildUrlParams();
            const url = `https://delphi-me.com/delphinium-pricing-report?${params.toString()}`;
            const schoolName = this.schoolNameInput.value.trim() || 'Delphinium';
            
            // Create HTML that's email-client friendly
            const htmlContent = `<div style="font-family: Arial, sans-serif;">
                <a href="${url}" style="color: #00adef; text-decoration: none;">
                    View ${schoolName}'s Delphinium Price Estimate
                </a>
            </div>`;
            
            // Create a temporary element for the rich HTML content
            const tempDiv = document.createElement('div');
            tempDiv.contentEditable = 'true';
            tempDiv.style.position = 'fixed';
            tempDiv.style.left = '-9999px';
            document.body.appendChild(tempDiv);
            
            // Set the HTML content
            tempDiv.innerHTML = htmlContent;
            
            // Select the content
            const range = document.createRange();
            range.selectNodeContents(tempDiv);
            const selection = window.getSelection();
            selection.removeAllRanges();
            selection.addRange(range);
            
            // Copy as rich text
            document.execCommand('copy');
            
            // Clean up
            document.body.removeChild(tempDiv);
            selection.removeAllRanges();
            
            // Show success feedback
            const originalText = this.copyLinkBtn.innerHTML;
            this.copyLinkBtn.innerHTML = '<i class="fas fa-check" aria-hidden="true"></i><span>Copied!</span>';
            this.copyLinkBtn.style.backgroundColor = '#00a74e';
            
            setTimeout(() => {
                this.copyLinkBtn.innerHTML = originalText;
                this.copyLinkBtn.style.backgroundColor = '';
            }, 2000);
        } catch (error) {
            console.error('Error copying link:', error);
            
            // Show error feedback
            const originalText = this.copyLinkBtn.innerHTML;
            this.copyLinkBtn.innerHTML = '<i class="fas fa-exclamation-triangle" aria-hidden="true"></i><span>Copy Failed</span>';
            this.copyLinkBtn.style.backgroundColor = '#dc3545';
            
            setTimeout(() => {
                this.copyLinkBtn.innerHTML = originalText;
                this.copyLinkBtn.style.backgroundColor = '';
            }, 2000);
        }
    }

    openInNewTab() {
        const params = this.buildUrlParams();
        window.open(`https://delphi-me.com/delphinium-pricing-report?${params.toString()}`, '_blank');
    }

    buildUrlParams() {
        // Get single-year calculation first
        const singleYearCalc = this.calculator.calculateTotal(
            parseInt(this.studentCountInput.value, 10),
            this.getSelectedSchoolType() === 'online',
            this.schoolDistrictCheckbox.checked,
            1, // Force single year calculation
            this.isFirstYearCheckbox.checked,
            {
                engagementBuilder: this.engagementBuilderCheckbox.checked,
                communityBuilder: this.communityBuilderCheckbox.checked
            }
        );

        const products = {};
        if (this.engagementBuilderCheckbox.checked && singleYearCalc.products.engagementBuilder) {
            products.engagementBuilder = {
                license: singleYearCalc.products.engagementBuilder.license,
                volumeDiscount: singleYearCalc.products.engagementBuilder.volumeDiscount
            };
        }
        if (this.communityBuilderCheckbox.checked && singleYearCalc.products.communityBuilder) {
            products.communityBuilder = {
                license: singleYearCalc.products.communityBuilder.license,
                volumeDiscount: singleYearCalc.products.communityBuilder.volumeDiscount
            };
        }

        return new URLSearchParams({
            schoolName: this.schoolNameInput.value,
            schoolType: this.getSelectedSchoolType(),
            students: this.studentCountInput.value,
            isDistrict: this.schoolDistrictCheckbox.checked,
            isFirstYear: this.isFirstYearCheckbox.checked,
            years: this.yearsSelect.value,
            engagementBuilder: this.engagementBuilderCheckbox.checked,
            communityBuilder: this.communityBuilderCheckbox.checked,
            notes: this.notesInput.value,
            products: btoa(JSON.stringify(products)),
            subtotal: singleYearCalc.baseSubtotal.toString(),
            implementationFee: singleYearCalc.implementationFee.toString(),
            multiProductDiscount: singleYearCalc.multiProductDiscount.toString(),
            items: btoa(JSON.stringify(this.getCurrentCustomItems()))
        });
    }

	getCurrentCustomItems() {
        return Array.from(this.itemsContainer.querySelectorAll('.custom-item')).map(item => ({
            name: item.querySelector('.item-name').value,
            isDiscount: item.querySelector('.type-select').value === 'discount',
            isPercent: item.querySelector('.calc-select').value === 'percent',
            amount: parseFloat(item.querySelector('.amount').value) || 0
        }));
    }
}

// Initialize the calculator when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const calculator = new ProductPricingCalculator();
    const displayManager = new ProductDisplayManager(calculator);
});
    

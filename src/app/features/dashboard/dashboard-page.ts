import { Component, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LocalDataService } from '../../core/local-data.service';
import { FoodEntry } from '../../core/models';

@Component({
  selector: 'app-dashboard-page',
  imports: [CommonModule],
  template: `
    <section class="dashboard">
      <h2>Dashboard</h2>
      <div class="insights-grid">
        <div class="insight-card">
          <h3>Food Consumption</h3>
          <div class="metric">
            <span class="value">{{ avgFoodPerDay().toFixed(1) }}</span>
            <span class="unit">items/day</span>
          </div>
          <p class="description">Average food items consumed per day</p>
        </div>

        <div class="insight-card">
          <h3>Drink Consumption</h3>
          <div class="metric">
            <span class="value">{{ avgDrinksPerDay().toFixed(1) }}</span>
            <span class="unit">items/day</span>
          </div>
          <p class="description">Average drink items consumed per day</p>
        </div>

        <div class="insight-card">
          <h3>Total Entries</h3>
          <div class="metric">
            <span class="value">{{ totalEntries() }}</span>
            <span class="unit">entries</span>
          </div>
          <p class="description">Total entries in the past 30 days</p>
        </div>

        <div class="insight-card">
          <h3>Most Popular Meal</h3>
          <div class="metric">
            <span class="value">{{ mostPopularMeal() || 'N/A' }}</span>
          </div>
          <p class="description">Most frequent meal type</p>
        </div>
      </div>
    </section>
  `,
  styles: `
    .dashboard {
      padding: var(--space-4);
      max-width: 1200px;
      margin: 0 auto;
    }

    h2 {
      font-size: 28px;
      font-weight: 600;
      margin-bottom: var(--space-5);
      color: var(--text);
      text-align: center;
    }

    .insights-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: var(--space-4);
      margin-top: var(--space-4);
    }

    .insight-card {
      background: var(--card);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      padding: var(--space-5);
      text-align: center;
      transition: box-shadow 0.2s ease;
    }

    .insight-card:hover {
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    }

    h3 {
      font-size: 18px;
      font-weight: 600;
      margin-bottom: var(--space-3);
      color: var(--text);
    }

    .metric {
      display: flex;
      flex-direction: column;
      align-items: center;
      margin-bottom: var(--space-2);
    }

    .value {
      font-size: 32px;
      font-weight: 700;
      color: var(--primary);
      line-height: 1;
    }

    .unit {
      font-size: 14px;
      color: var(--text-muted);
      margin-top: var(--space-1);
    }

    .description {
      font-size: 14px;
      color: var(--text-muted);
      margin: 0;
    }

    /* Desktop styles */
    @media (min-width: 768px) {
      .dashboard {
        padding: var(--space-5);
      }

      h2 {
        font-size: 32px;
        margin-bottom: var(--space-6);
      }

      .insights-grid {
        grid-template-columns: repeat(2, 1fr);
        gap: var(--space-5);
      }

      .insight-card {
        padding: var(--space-6);
      }

      h3 {
        font-size: 20px;
        margin-bottom: var(--space-4);
      }

      .value {
        font-size: 40px;
      }

      .unit {
        font-size: 16px;
      }

      .description {
        font-size: 16px;
      }
    }
  `
})
export class DashboardPage {
  private readonly thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  constructor(private data: LocalDataService) {}

  // Get entries from the past 30 days
  private readonly recentEntries = computed(() => {
    return this.data.entries().filter(entry =>
      new Date(entry.createdAt) >= this.thirtyDaysAgo
    );
  });

  // Calculate average food items per day
  protected readonly avgFoodPerDay = computed(() => {
    const entries = this.recentEntries();
    const foodEntries = entries.filter(e => e.foodDrinkType === 'food');
    return entries.length > 0 ? foodEntries.length / 30 : 0;
  });

  // Calculate average drink items per day
  protected readonly avgDrinksPerDay = computed(() => {
    const entries = this.recentEntries();
    const drinkEntries = entries.filter(e => e.foodDrinkType === 'drink');
    return entries.length > 0 ? drinkEntries.length / 30 : 0;
  });

  // Get total entries in past 30 days
  protected readonly totalEntries = computed(() => {
    return this.recentEntries().length;
  });

  // Get most popular meal type
  protected readonly mostPopularMeal = computed(() => {
    const entries = this.recentEntries();
    const mealCounts = entries.reduce((acc, entry) => {
      acc[entry.mealType] = (acc[entry.mealType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const mostPopular = Object.entries(mealCounts)
      .sort(([,a], [,b]) => b - a)[0];

    return mostPopular ? mostPopular[0] : null;
  });
}

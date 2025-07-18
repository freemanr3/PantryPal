import type { RecipeDetail } from './types';

export function printRecipe(recipe: RecipeDetail): void {
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Please allow popups to print recipes');
    return;
  }

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>${recipe.title} - Recipe</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            line-height: 1.6;
          }
          h1 {
            color: #333;
            border-bottom: 2px solid #orange;
            padding-bottom: 10px;
          }
          .recipe-info {
            display: flex;
            gap: 20px;
            margin: 20px 0;
            background: #f5f5f5;
            padding: 15px;
            border-radius: 8px;
          }
          .ingredients {
            margin: 20px 0;
          }
          .ingredients ul {
            list-style-type: none;
            padding: 0;
          }
          .ingredients li {
            padding: 8px 0;
            border-bottom: 1px solid #eee;
          }
          .instructions {
            margin: 20px 0;
          }
          .instructions ol {
            padding-left: 20px;
          }
          .instructions li {
            margin: 10px 0;
            padding: 5px 0;
          }
          @media print {
            body { margin: 0; }
          }
        </style>
      </head>
      <body>
        <h1>${recipe.title}</h1>
        
        <div class="recipe-info">
          <div><strong>Prep Time:</strong> ${recipe.readyInMinutes} minutes</div>
          <div><strong>Servings:</strong> ${recipe.servings}</div>
          ${recipe.nutrition ? `<div><strong>Calories:</strong> ${recipe.nutrition.calories}</div>` : ''}
        </div>

        <div class="ingredients">
          <h2>Ingredients</h2>
          <ul>
            ${recipe.extendedIngredients.map(ing => `<li>${ing.original}</li>`).join('')}
          </ul>
        </div>

        <div class="instructions">
          <h2>Instructions</h2>
          <ol>
            ${recipe.analyzedInstructions[0]?.steps.map(step => `<li>${step.step}</li>`).join('') || 
              `<li>${recipe.instructions || 'No instructions available'}</li>`}
          </ol>
        </div>

        <script>
          window.onload = function() {
            window.print();
            window.onafterprint = function() {
              window.close();
            };
          };
        </script>
      </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
} 
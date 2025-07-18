import type { RecipeDetail } from '@/services/recipeService';

export const printRecipe = (recipe: RecipeDetail) => {
  // Create a new window for printing
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  // Generate print-friendly HTML
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>${recipe.title} - Pantry Pal Recipe</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
          }
          h1 { color: #333; margin-bottom: 10px; }
          .meta { color: #666; margin-bottom: 20px; }
          .ingredients { margin-bottom: 30px; }
          .instructions { margin-bottom: 30px; }
          img { max-width: 100%; height: auto; margin-bottom: 20px; }
          @media print {
            body { margin: 0; padding: 15px; }
            button { display: none; }
            a { text-decoration: none; color: inherit; }
          }
        </style>
      </head>
      <body>
        <h1>${recipe.title}</h1>
        <div class="meta">
          <p>Servings: ${recipe.servings}</p>
          <p>Preparation Time: ${recipe.preparationMinutes || '-'} minutes</p>
          <p>Cooking Time: ${recipe.cookingMinutes || '-'} minutes</p>
          <p>Total Time: ${recipe.readyInMinutes || '-'} minutes</p>
        </div>
        
        <img src="${recipe.image}" alt="${recipe.title}" />
        
        <div class="ingredients">
          <h2>Ingredients</h2>
          <ul>
            ${recipe.extendedIngredients.map(ing => 
              `<li>${ing.amount} ${ing.unit} ${ing.name}</li>`
            ).join('')}
          </ul>
        </div>
        
        <div class="instructions">
          <h2>Instructions</h2>
          ${recipe.analyzedInstructions.length > 0 
            ? `<ol>${recipe.analyzedInstructions[0].steps.map(step => 
                `<li>${step.step}</li>`
              ).join('')}</ol>`
            : `<p>${recipe.instructions}</p>`
          }
        </div>
        
        <div class="footer">
          <p>Recipe from Pantry Pal - pantrypal.com</p>
          <p>Printed on ${new Date().toLocaleDateString()}</p>
        </div>
        
        <script>
          window.onload = () => {
            window.print();
            setTimeout(() => window.close(), 500);
          };
        </script>
      </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
}; 
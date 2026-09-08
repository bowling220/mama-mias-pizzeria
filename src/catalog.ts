export type Size = { label: string; cents: number };
export type Item = {
  id: string;
  name: string;
  category: string;
  description: string;
  sizes: Size[];
  available: boolean;
  featured?: boolean;
};
export const money = (cents: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(
    cents / 100,
  );
const sizes = (prices: number[], labels?: string[]) =>
  prices.map((cents, i) => ({
    cents,
    label:
      labels?.[i] ||
      (prices.length === 2
        ? ["Small", "Large"][i]
        : prices.length === 3
          ? ["Mini", "Small", "Large"][i]
          : "Regular"),
  }));
const item = (
  name: string,
  category: string,
  prices: number[],
  description = "",
  labels?: string[],
  available = true,
): Item => ({
  id: (category + "-" + name).toLowerCase().replace(/[^a-z0-9]+/g, "-"),
  name,
  category,
  sizes: sizes(prices, labels),
  description,
  available,
});
export const catalog: Item[] = [
  item(
    "Cheese Pizza",
    "Pizza",
    [899, 1055],
    "Fresh dough, pizza sauce, mozzarella.",
    ["12-inch · 8 slices", "14-inch · 10 slices"],
  ),
  ...(
    [
      [
        "White",
        [939, 1065],
        "Olive oil, ricotta, garlic, mozzarella, oregano and basil.",
      ],
      [
        "Ranch",
        [989, 1099],
        "House-made ranch and mozzarella. Chicken additions are unavailable.",
      ],
      [
        "Italian White",
        [1205, 1485],
        "Olive oil, ricotta, garlic, mozzarella, mushrooms, onions and sweet peppers.",
      ],
      [
        "Chicken Ranch",
        [1205, 1485],
        "House-made ranch, mozzarella and breaded chicken.",
      ],
      [
        "Chicken BBQ",
        [1205, 1485],
        "House-made BBQ sauce, mozzarella and breaded chicken.",
      ],
      [
        "Hawaiian Chicken BBQ",
        [1705],
        "Thin crust, BBQ sauce, shredded chicken, pineapple and bacon.",
      ],
      ["Hawaiian", [1335, 1649], "Mozzarella, ham, pineapple and bacon."],
      [
        "Broccoli Tomato Garlic",
        [1205, 1485],
        "Olive oil, garlic, mozzarella, broccoli and tomato.",
      ],
      [
        "Italian Style Steak",
        [1699],
        "Ranch, ricotta, mozzarella, steak, mushrooms, onions and peppers.",
      ],
      [
        "Supreme",
        [1535, 1809],
        "Pepperoni, ham, sausage, mushrooms, onions, peppers, olives, bacon and extra cheese.",
      ],
      [
        "Veggie",
        [1259, 1489],
        "Mozzarella, mushrooms, peppers, black olives, red onions and tomatoes.",
      ],
      [
        "Buffalo Chicken",
        [1705],
        "Ranch, mozzarella and shredded buffalo chicken.",
      ],
      [
        "Meatlovers",
        [1685],
        "Mozzarella, pepperoni, ham, meatballs, sausage and bacon.",
      ],
      [
        "Margherita",
        [1385],
        "Thin crust, olive oil, tomato sauce, fresh mozzarella, roma tomatoes and basil.",
      ],
      [
        "Taco",
        [1649],
        "Thin crust, taco sauce, beef, cheeses, olives, onions, tomatoes, lettuce and sour cream.",
      ],
      [
        "Ranch Dill Pickle",
        [1439],
        "Ranch, mozzarella, cheddar blend, dill pickles and dill.",
      ],
    ] as [string, number[], string][]
  ).map(([n, p, d]) =>
    item(
      n,
      "Specialty Pizza",
      p,
      d,
      p.length === 1 ? ["Large"] : undefined,
      n !== "Italian Style Steak",
    ),
  ),
  item(
    "Cheese Calzone",
    "Calzones & Stromboli",
    [955, 1109],
    "Mozzarella, ricotta and pizza sauce.",
  ),
  item(
    "Stromboli",
    "Calzones & Stromboli",
    [1169, 1445],
    "Mozzarella, pepperoni, sausage, mushrooms, onions, peppers and pizza sauce.",
  ),
  item(
    "Chicken Ranch Calzone",
    "Calzones & Stromboli",
    [1565],
    "Mozzarella, ranch, ricotta, breaded chicken and bacon.",
  ),
  item(
    "Loaded Steak Calzone",
    "Calzones & Stromboli",
    [],
    "Steak, cheeses, ranch, mushrooms, onions and peppers.",
    undefined,
    false,
  ),
  item(
    "Traditional Wings",
    "Wings",
    [1299],
    "By the pound, with ranch. One flavor per order; drums/flats selection unavailable.",
    ["One pound"],
  ),
  item(
    "Boneless Wings",
    "Wings",
    [1029],
    "8–10 pieces, tossed or served with a dipping sauce.",
    ["8–10 pieces"],
  ),
  ...(
    [
      [
        "Italian Combo",
        725,
        "Ham, salami, pepperoni, provolone, lettuce, tomato and Italian dressing.",
      ],
      [
        "Ham & Cheese",
        725,
        "Ham, provolone, lettuce, tomato and Italian dressing.",
      ],
      ["Pizza Sub", 725, "Pizza sauce, pepperoni and mozzarella."],
      [
        "Pepperoni",
        725,
        "Pepperoni, provolone, lettuce, tomato and Italian dressing.",
      ],
      ["Meatball and Cheese", 749, "Marinara, meatballs and mozzarella."],
      ["Sausage and Cheese", 729, "Marinara, Italian sausage and mozzarella."],
      [
        "Veggie Sub",
        725,
        "Mushrooms, onions, peppers, provolone, lettuce, tomato and Italian dressing.",
      ],
      [
        "Meatball Zombie",
        785,
        "Marinara, meatballs, mozzarella, mushrooms, onions and banana peppers.",
      ],
      [
        "Sausage Zombie",
        785,
        "Marinara, sausage, mozzarella, mushrooms, onions and banana peppers.",
      ],
      [
        "Nitemare",
        775,
        "Pizza sauce, pepperoni, mozzarella, mushrooms, onions and banana peppers.",
      ],
      [
        "Chicken and Cheese",
        785,
        "Chicken tenders, provolone, lettuce, tomato and Italian dressing.",
      ],
      ["Chicken BBQ Sub", 789, "Chicken tenders, BBQ sauce and provolone."],
      [
        "Chicken Ranch Sub",
        789,
        "Ranch, chicken tenders, provolone, bacon, lettuce and tomato.",
      ],
      [
        "Chicken Parmigiana",
        789,
        "Marinara, chicken tenders, parmesan and mozzarella.",
      ],
      [
        "Buffalo Chicken Sub",
        815,
        "Ranch, buffalo chicken tenders and mozzarella.",
      ],
      ["BLT", 815, "Bacon, lettuce, tomato and mayo."],
      ["Tuna and Cheese", 815, "Tuna salad, provolone, lettuce and tomato."],
    ] as [string, number, string][]
  ).map(([n, p, d]) =>
    item(n, "Subs", [p, 919], d, [
      "10-inch toasted sub",
      "12-inch folded wedge",
    ]),
  ),
  ...[
    "Steak and Cheese",
    "Loaded Steak and Cheese",
    "Turkey and Cheese",
    "Turkey Club",
  ].map((n) =>
    item(
      n,
      "Subs",
      [],
      "Temporarily unavailable on the published menu.",
      undefined,
      false,
    ),
  ),
  ...(
    [
      [
        "Antipasto",
        [569, 1025, 1105],
        "Greens, ham, salami, provolone, pepperoni, chickpeas, olives, tomatoes and pepperoncini.",
      ],
      [
        "Garden",
        [429, 659, 855],
        "Greens, chickpeas, olives, tomatoes, cucumber, pepperoncini and mozzarella.",
      ],
      [
        "Breaded Chicken",
        [569, 995, 1219],
        "Greens, breaded chicken, chickpeas, olives, tomatoes, pepperoncini and mozzarella.",
      ],
      [
        "Grilled Chicken",
        [1159],
        "Greens, grilled chicken, chickpeas, olives, tomatoes, pepperoncini and mozzarella.",
      ],
      [
        "Caesar",
        [1159],
        "Greens, grilled chicken, parmesan, croutons and Caesar dressing.",
      ],
      [
        "Mediterranean",
        [1159],
        "Greens, grilled chicken, olives, tomatoes, peppers, onion, cucumber, feta and Greek vinaigrette.",
      ],
    ] as [string, number[], string][]
  ).map(([n, p, d]) => item(n, "Salads", p, d)),
  ...(
    [
      ["Breadsticks", 499, "Fresh dough breadsticks."],
      ["Garlic Bread", 389, "10-inch roll with garlic spread."],
      ["Pepperoni Balls", 485, "Three fried dough balls with pepperoni."],
      ["Pizza Balls", 629, "Three pepperoni balls with sauce and mozzarella."],
      [
        "Combo Ball",
        329,
        "Pepperoni ball with ham, salami, provolone, lettuce, tomato and dressing.",
      ],
      [
        "Pizza Roll",
        539,
        "Pepperoni and mozzarella in fresh dough, pizza sauce on the side.",
      ],
      [
        "Sausage Roll",
        539,
        "Sausage and mozzarella in fresh dough, pizza sauce on the side.",
      ],
      ["Pizza Mia", 579, "French bread style pizza on a 10-inch sub roll."],
      ["Zucchini Sticks", 645, "Breaded zucchini with dipping sauce."],
      ["Mushrooms", 695, "Battered mushrooms with ranch."],
      [
        "Cheese Sticks",
        645,
        "Five battered mozzarella sticks with dipping sauce.",
      ],
      [
        "Veggie Basket",
        645,
        "Mushrooms, cauliflower, zucchini and onion petals.",
      ],
      [
        "Mac and Cheese Bites",
        695,
        "Battered mac and cheese bites with ranch.",
      ],
      ["Chicken Tenders", 645, "Five tenders with ranch."],
      ["Fries", 415, "Fries with ketchup."],
      ["Chicken Tender Basket", 969, "Five tenders, fries, ranch and ketchup."],
      [
        "Loaded Potato Dippers",
        969,
        "Potato scoops with cheese sauce, bacon, sour cream and scallions.",
      ],
      ["Banana Pepper Rings", 725, "Breaded banana pepper rings with ranch."],
      ["Onion Petals", 619, "Battered onion petals with ranch."],
      ["Dill Pickle Chips", 695, "Breaded dill pickle chips with ranch."],
    ] as [string, number, string][]
  ).map(([n, p, d]) => item(n, "Starters", [p], d)),
  item(
    "4-inch Cookie",
    "Snacks",
    [199],
    "Choose from the published cookie flavors.",
  ),
];
catalog.forEach(
  (x) =>
    (x.featured = [
      "Cheese Pizza",
      "Stromboli",
      "Traditional Wings",
      "Antipasto",
    ].includes(x.name)),
);
export type Extra = { id: string; label: string; small: number; large: number };
export const regular =
  "Extra cheese,Ricotta,Pepperoni,Onions,Sweet peppers,Banana peppers,Jalapeños,Black olives,Fresh tomatoes,Spinach,Broccoli,Mushrooms,Pineapple"
    .split(",")
    .map((label) => ({ id: label, label, small: 150, large: 200 }));
export const premium =
  "Bacon,Breaded chicken,Meatballs,Green olives,Feta,Roasted garlic,Sausage,Ham"
    .split(",")
    .map((label) => ({ id: label, label, small: 175, large: 225 }));
export const dressings = [
  "Italian",
  "French",
  "Oil & Vinegar",
  "Honey Mustard",
  "Blue Cheese",
  "Balsamic Vinaigrette",
  "Ranch",
  "Caesar",
  "Greek Vinaigrette",
];
export const sauces = [
  "Hot",
  "Buffalo",
  "Medium",
  "BBQ",
  "Citrus Chipotle BBQ",
  "Honey BBQ",
  "Honey Mustard",
  "Honey Hot",
  "Wet Cajun",
  "Dry Ranch",
  "Dry Cajun",
  "Dry Cranch",
  "Butter and Garlic",
  "Parmesan Garlic",
  "House",
];
export function extrasFor(i: Item): Extra[] {
  if (["Pizza", "Specialty Pizza", "Calzones & Stromboli"].includes(i.category))
    return [
      ...regular,
      ...premium.filter(
        (x) => !(i.name === "Ranch" && x.id === "Breaded chicken"),
      ),
      { id: "Anchovies", label: "Anchovies", small: 225, large: 450 },
    ];
  if (i.category === "Subs")
    return [
      {
        id: "Extra vegetables",
        label: "Extra vegetables",
        small: 65,
        large: 65,
      },
      { id: "Extra cheese", label: "Extra cheese", small: 125, large: 125 },
    ];
  if (["Breadsticks", "Garlic Bread"].includes(i.name))
    return [
      { id: "Mozzarella", label: "Mozzarella", small: 125, large: 125 },
      { id: "Marinara", label: "Marinara", small: 89, large: 89 },
    ];
  return [];
}
export type Line = {
  id: string;
  itemId: string;
  size: number;
  extras: string[];
  choice: string;
  notes: string;
  quantity: number;
};
export function choicesFor(i: Item) {
  return i.category === "Wings"
    ? sauces
    : i.category === "Salads"
      ? dressings
      : i.category === "Snacks"
        ? [
            "M&M Chocolate Chip",
            "Reeses Pieces Peanut Butter",
            "White Chocolate Chip Macadamia Nut",
            "Oatmeal Raisin",
          ]
        : [];
}
export function unitPrice(item: Item, line: Line) {
  const large =
    item.sizes[line.size]?.label.toLowerCase().includes("large") ||
    item.sizes[line.size]?.label.includes("14-inch");
  return (
    (item.sizes[line.size]?.cents || 0) +
    extrasFor(item)
      .filter((x) => line.extras.includes(x.id))
      .reduce((sum, x) => sum + (large ? x.large : x.small), 0) +
    (item.category === "Wings" &&
    ["Citrus Chipotle BBQ", "Honey Hot", "House"].includes(line.choice)
      ? 25
      : 0)
  );
}
export const source = {
  url: "https://mamamiaserie.com/menu",
  verified: "2026-09-08",
};

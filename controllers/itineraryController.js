const express = require("express");
const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

const geminiApiKey = process.env.API_KEY;
const googleAI = new GoogleGenerativeAI(geminiApiKey);
const geminiConfig = {
  temperature: 0.7,
  topP: 1,
  maxOutputTokens: 1024,
};

const geminiModel = googleAI.getGenerativeModel({
  model: "gemini-pro",
  geminiConfig,
});

const generateItinerary = async (source, destination, days, budget) => {
    const prompt = `Create a ${days}-day travel itinerary from ${source} to ${destination} within a budget of ${budget} rupees. Include daily activities, travel options, food recommendations, and give a clear and short itinerary in bullet points.`;
    try {
      const result = await geminiModel.generateContent(prompt);
      const itineraryText = result.response.text();
      return formatItinerary(itineraryText);
    } catch (error) {
      console.error("Error generating itinerary:", error);
      throw new Error("Unable to generate itinerary at this time.");
    }
  };
  
  // Function to format and clean up the itinerary response
  const formatItinerary = (itineraryText) => {
    const itinerary = itineraryText.split("\n").map((line) => line.trim()).filter((line) => line.length > 0);
  
    // Clean up duplicate day labels and structure activities under each day
    let formattedItinerary = [];
    let currentDay = null;
  
    itinerary.forEach((line, index) => {
      // Check if the line contains a day header like "**Day X:**"
      const dayMatch = line.match(/^\*\*Day (\d+):\*\*/);
  
      if (dayMatch) {
        // Extract the day number
        currentDay = dayMatch[1];
      } else if (currentDay) {
        // Add the activity under the current day
        formattedItinerary.push({
          dayNumber: currentDay,
          activity: line,
        });
      }
    });
  
    return formattedItinerary;
  };
  

const getItinerary = async (req, res) => {
  const { source, destination, days, budget } = req.body;

  if (!source || !destination || !days || !budget) {
    return res.status(400).render("itinerary", { error: "All fields are required." });
  }

  try {
    const itinerary = await generateItinerary(source, destination, days, budget);
    res.render("itinerary", { itinerary, source, destination, days, budget });
  } catch (error) {
    res.status(500).render("itinerary", { error: "Failed to generate itinerary. Please try again later." });
  }
};

module.exports = { getItinerary };

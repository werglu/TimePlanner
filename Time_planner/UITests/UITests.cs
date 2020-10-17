using OpenQA.Selenium;
using OpenQA.Selenium.Chrome;
using System;
using Xunit;

namespace UITests
{
    public class UITests : IDisposable
    {
        private readonly IWebDriver _driver;
        public UITests()
        {
            _driver = new ChromeDriver();
        }

        public void Dispose()
        {
            _driver.Quit();
            _driver.Dispose();
        }

        [Fact]
        public void Can_Navigate_To_MainPage()
        {
            _driver.Navigate()
                .GoToUrl("https://localhost:44336/");
            Assert.Equal("Time planner app", _driver.Title);
        }
    }
}
